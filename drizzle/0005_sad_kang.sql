CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
