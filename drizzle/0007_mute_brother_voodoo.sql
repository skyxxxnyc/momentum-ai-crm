CREATE TABLE `email_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`fromEmail` varchar(320) NOT NULL,
	`toEmail` varchar(320) NOT NULL,
	`subject` varchar(500),
	`body` text,
	`direction` enum('inbound','outbound') NOT NULL,
	`status` enum('sent','delivered','opened','clicked','bounced','failed') DEFAULT 'sent',
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`sentBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`category` varchar(100),
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`subject` varchar(500),
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `thread_idx` ON `email_messages` (`threadId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `email_messages` (`status`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `email_templates` (`ownerId`);--> statement-breakpoint
CREATE INDEX `contact_idx` ON `email_threads` (`contactId`);