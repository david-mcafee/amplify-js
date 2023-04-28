// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignRequestOptions } from '../src/clients/middleware/signing/signer/signatureV4/types';
import { Signer } from '../src/Signer';
import { DateUtils } from '../src/Util/DateUtils';
import {
	credentials,
	getDefaultRequest,
	signingDate,
	signingOptions,
	signingRegion,
	signingService,
	url,
} from './clients/middleware/signing/signer/signatureV4/testUtils/data';
import { signingTestTable } from './clients/middleware/signing/signer/signatureV4/testUtils/signingTestTable';

const getDateSpy = jest.spyOn(DateUtils, 'getDateWithClockOffset');

describe('Signer.sign', () => {
	beforeAll(() => {
		getDateSpy.mockReturnValue(signingDate);
	});

	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedAuthorization }) => {
				const updatedRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions: SignRequestOptions = {
					...signingOptions,
					...options,
				};
				return [name, updatedRequest, updatedOptions, expectedAuthorization];
			}
		)
	)(
		'signs request with %s',
		(
			_,
			{ url, ...request },
			{ credentials, signingRegion, signingService },
			expected
		) => {
			const { accessKeyId, secretAccessKey, sessionToken } = credentials;
			const accessInfo = {
				access_key: accessKeyId,
				secret_key: secretAccessKey,
				session_token: sessionToken,
			};
			const serviceInfo = {
				region: signingRegion,
				service: signingService,
			};
			const signedRequest = Signer.sign(
				{ ...request, url: url.toString() },
				accessInfo,
				serviceInfo as any
			);
			expect(signedRequest.headers?.Authorization).toBe(expected);
		}
	);

	describe('Error handling', () => {
		const { accessKeyId, secretAccessKey, sessionToken } = credentials;
		const accessInfo = {
			access_key: accessKeyId,
			secret_key: secretAccessKey,
			session_token: sessionToken,
		};
		const serviceInfo = {
			region: signingRegion,
			service: signingService,
		};

		test('should throw an Error if body attribute is passed to sign method', () => {
			const request = {
				...getDefaultRequest(),
				body: 'foo',
				url,
			};

			expect(() => {
				Signer.sign(request, accessInfo, serviceInfo as any);
			}).toThrow();
		});

		test('should not throw an Error if data attribute is passed to sign method', () => {
			const request = {
				...getDefaultRequest(),
				data: 'foo',
				url,
			};

			expect(() => {
				Signer.sign(request, accessInfo, serviceInfo as any);
			}).not.toThrow();
		});
	});
});

describe('Signer.signUrl', () => {
	beforeAll(() => {
		getDateSpy.mockReturnValue(signingDate);
	});

	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedUrl }) => {
				const updatedRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions: SignRequestOptions = {
					...signingOptions,
					...options,
				};
				return [name, updatedRequest, updatedOptions, expectedUrl];
			}
		)
	)(
		'signs url with %s',
		(
			_,
			{ url, ...request },
			{ credentials, signingRegion, signingService },
			expected
		) => {
			const { accessKeyId, secretAccessKey, sessionToken } = credentials;
			const accessInfo = {
				access_key: accessKeyId,
				secret_key: secretAccessKey,
				session_token: sessionToken,
			};
			const serviceInfo = {
				region: signingRegion,
				service: signingService,
			};
			const signedUrl = Signer.signUrl(
				{ ...request, url: url.toString() },
				accessInfo,
				serviceInfo as any
			);
			expect(signedUrl).toBe(expected);
		}
	);
});
