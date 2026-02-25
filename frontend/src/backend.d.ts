import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Game {
    betAmount: bigint;
    userId: string;
    profitLoss: bigint;
    timestamp: Time;
    gameName: string;
    outcome: string;
}
export type Time = bigint;
export interface User {
    referralCode: string;
    balance: bigint;
    vipLevel: bigint;
    name: string;
    referredBy?: string;
    mobile: string;
}
export interface DepositRequestInput {
    userId: string;
    utrNumber: string;
    amount: bigint;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export type RegisterResult = {
    __kind__: "mobileAlreadyExists";
    mobileAlreadyExists: null;
} | {
    __kind__: "invalidMobileFormat";
    invalidMobileFormat: null;
} | {
    __kind__: "internalError";
    internalError: null;
} | {
    __kind__: "invalidReferralCode";
    invalidReferralCode: null;
} | {
    __kind__: "success";
    success: User;
} | {
    __kind__: "badRequest";
    badRequest: null;
};
export interface DepositRequest {
    status: string;
    userId: string;
    timestamp: Time;
    utrNumber: string;
    amount: bigint;
}
export interface UserProfile {
    referralCode: string;
    vipLevel: bigint;
    name: string;
    mobile: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveDeposit(depositId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDepositRequest(arg0: DepositRequestInput): Promise<bigint>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepositStatus(depositId: bigint): Promise<string>;
    getGameHistory(mobile: string): Promise<Array<Game>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getPaymentQR(): Promise<ExternalBlob | null>;
    getPendingDeposits(): Promise<Array<[bigint, DepositRequest]>>;
    getUser(mobile: string): Promise<User>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(mobile: string): Promise<User>;
    recordGameRound(gameName: string, betAmount: bigint, outcome: string, profitLoss: bigint): Promise<bigint>;
    registerUser(mobile: string, name: string, referredBy: string): Promise<RegisterResult>;
    resolveDepositRequest(depositId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPaymentQR(qr: ExternalBlob): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
}
