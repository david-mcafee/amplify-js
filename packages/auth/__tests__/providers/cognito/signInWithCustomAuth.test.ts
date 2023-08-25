// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import { signInWithCustomAuth } from '../../../src/providers/cognito/apis/signInWithCustomAuth';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { InitiateAuthCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

const authConfig = {
	userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: 'us-west-2_zzzzz',
};
const authConfigWithClientmetadata = {
	userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: 'us-west-2_zzzzz',
	...authAPITestParams.configWithClientMetadata,
};
Amplify.configure({
	Auth: authConfig,
});
describe('signIn API happy path cases', () => {
	let handleCustomAuthFlowWithoutSRPSpy;

	beforeEach(() => {
		handleCustomAuthFlowWithoutSRPSpy = jest
			.spyOn(initiateAuthHelpers, 'handleCustomAuthFlowWithoutSRP')
			.mockImplementationOnce(
				async (): Promise<InitiateAuthCommandOutput> =>
					authAPITestParams.CustomChallengeResponse
			);
	});

	afterEach(() => {
		handleCustomAuthFlowWithoutSRPSpy.mockClear();
	});

	test('signIn API invoked with authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			options: {
				serviceOptions: {
					authFlowType: 'CUSTOM_WITHOUT_SRP',
				},
			},
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledTimes(1);
	});

	test('signInWithCustomAuth API should return a SignInResult', async () => {
		const result = await signInWithCustomAuth({
			username: authAPITestParams.user1.username,
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledTimes(1);
	});
	test('handleCustomAuthFlowWithoutSRP should be called with clientMetada from request', async () => {
		const username = authAPITestParams.user1.username;

		await signInWithCustomAuth({
			username,
			options: {
				serviceOptions: authAPITestParams.configWithClientMetadata,
			},
		});
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledWith(
			username,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig
		);
	});

	test('handleCustomAuthFlowWithoutSRP should be called with clientMetada from config', async () => {
		Amplify.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				...authAPITestParams.configWithClientMetadata,
			},
		});
		const username = authAPITestParams.user1.username;
		await signInWithCustomAuth({
			username,
		});
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledWith(
			username,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfigWithClientmetadata
		);
	});
});

describe('signIn API error path cases:', () => {
	test('signIn API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await signIn({
				username: '',
				options: {
					serviceOptions: {
						authFlowType: 'CUSTOM_WITHOUT_SRP',
					},
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignInUsername);
		}
	});

	test('signIn API should throw a validation AuthError when password is not empty and when authFlow is CUSTOM_WITHOUT_SRP', async () => {
		expect.assertions(2);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					serviceOptions: {
						authFlowType: 'CUSTOM_WITHOUT_SRP',
					},
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.CustomAuthSignInPassword);
		}
	});

	test('signIn API should raise service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(InitiateAuthException.InvalidParameterException)
			)
		);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				options: {
					serviceOptions: {
						authFlowType: 'CUSTOM_WITHOUT_SRP',
					},
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InvalidParameterException);
		}
	});
});