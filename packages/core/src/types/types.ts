import { InputLogEvent, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { Credentials } from '@aws-sdk/types';
import type { Observable } from 'rxjs';

export interface AmplifyConfig {
	Analytics?: object;
	Auth?: object;
	API?: object;
	Logging?: object;
	Storage?: object;
	Cache?: object;
	Geo?: object;
	Notifications?: {
		InAppMessaging?: object;
	};
	ssr?: boolean;
}

export interface ICredentials {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	identityId: string;
	authenticated: boolean;
	// Long term creds do not provide an expiration date
	expiration?: Date;
}

/**
 * @private
 * Internal use of Amplify only
 */

export type DelayFunction = (
	attempt: number,
	args?: any[],
	error?: Error
) => number | false;

export interface LoggingProvider {
	// return the name of you provider
	getProviderName(): string;

	// return the name of you category
	getCategoryName(): string;

	// configure the plugin
	configure(config?: object): object;

	// take logs and push to provider
	pushLogs(logs: InputLogEvent[]): void;
}

export interface AWSCloudWatchProviderOptions {
	logGroupName?: string;
	logStreamName?: string;
	region?: string;
	credentials?: Credentials;
	endpoint?: string;
}

export interface CloudWatchDataTracker {
	eventUploadInProgress: boolean;
	logEvents: InputLogEvent[];
	verifiedLogGroup?: LogGroup;
}

export interface AmplifyUserSessionProvider {
	getUserSession: (
		options?: GetUserSessionOptions
	) => Promise<AmplifyUserSession>;
	listenUserSession(): Observable<AmplifyUserSession>;
}

// Other types just for reference

export type GetUserSessionOptions = {
	refresh?: boolean;
};

export type AmplifyUserSession = {
	isLoggedIn: boolean;
	username?: string;
	credentials?: ICredentials;
	jwts?: JWTS;
};

export interface JWT {
	payload: JSON;
	header: JSON;
	signature: string;
	expiration?: Date;
	toString: () => string;
	isValid: () => boolean;
}

export type JWTS = {
	accessToken?: JWT;
	idToken?: JWT;
};
