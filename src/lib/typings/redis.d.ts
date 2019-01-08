import { RedisClient } from "redis";

export interface PromisifiedRedisClient extends RedisClient {
	delAsync(...args: any[]): Promise<any>;
	hdelAsync(...args: any[]): Promise<any>;
	hgetAsync(...args: any[]): Promise<any>;
	hgetallAsync(...args: any[]): Promise<any>;
	hmsetAsync(...args: any[]): Promise<any>;
	hsetAsync(...args: any[]): Promise<any>;
	saddAsync(...args: any[]): Promise<any>;
	sismemberAsync(...args: any[]): Promise<any>;
	sremAsync(...args: any[]): Promise<any>;
}