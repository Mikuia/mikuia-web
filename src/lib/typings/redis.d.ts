import { RedisClient } from "redis";

export interface PromisifiedRedisClient extends RedisClient {
	hgetAsync(...args: any[]): Promise<any>;
	hgetallAsync(...args: any[]): Promise<any>;
	hsetAsync(...args: any[]): Promise<any>;
	saddAsync(...args: any[]): Promise<any>;
}