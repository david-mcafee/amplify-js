// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession } from '../../../singleton/Auth/types';
import { UserProfile } from '../../../types';
import { EventBufferConfig } from './buffer';

export type SupportedCategory =
	| 'Analytics'
	| 'Core'
	| 'InAppMessaging'
	| 'PushNotification';

type SupportedChannelType = 'APNS' | 'APNS_SANDBOX' | 'GCM' | 'IN_APP';

export type PinpointProviderConfig = {
	Pinpoint: Partial<EventBufferConfig> & {
		appId: string;
		region: string;
	};
};

export type PinpointServiceOptions = {
	address?: string;
	optOut?: 'ALL' | 'NONE';
	userAttributes?: Record<string, string[]>;
};

export type PinpointSession = {
	Id: string;
	Duration?: number;
	StartTimestamp: string;
	StopTimestamp?: string;
};

export type PinpointAnalyticsEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

// Common type that is required for operations that may trigger an endpoint update
type PinpointCommonParameters = {
	appId: string;
	category: SupportedCategory;
	channelType?: SupportedChannelType;
	credentials: Required<AuthSession>['credentials'];
	identityId?: AuthSession['identityId'];
	region: string;
	userAgentValue?: string;
};

export type PinpointUpdateEndpointInput = PinpointCommonParameters &
	PinpointServiceOptions & {
		userId?: string;
		userProfile?: UserProfile;
	};

export type PinpointRecordInput = Partial<EventBufferConfig> &
	PinpointCommonParameters & {
		event: PinpointAnalyticsEvent;
	};
