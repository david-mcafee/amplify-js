// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PinpointProviderConfig } from '../../common/AWSPinpointProviderCommon/types';

export interface InAppMessagingConfig {
	listenForAnalyticsEvents?: boolean;
	AWSPinpoint?: PinpointProviderConfig;
}