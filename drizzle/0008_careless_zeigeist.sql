CREATE TABLE `sequence_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`tags` json,
	`steps` json NOT NULL,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sequence_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `category_idx` ON `sequence_templates` (`category`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `sequence_templates` (`createdBy`);