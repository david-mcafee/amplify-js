// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyError,
	AmplifyErrorParams,
} from '@aws-amplify/core/internals/utils';

export class RestApiError extends AmplifyError {
	constructor(params: AmplifyErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = RestApiError;
		Object.setPrototypeOf(this, RestApiError.prototype);
	}
}
