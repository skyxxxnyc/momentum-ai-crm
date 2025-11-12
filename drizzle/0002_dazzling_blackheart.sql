CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`featuredImage` varchar(500),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`category` varchar(255),
	`tags` text,
	`seoTitle` varchar(500),
	`seoDescription` text,
	`authorId` int NOT NULL,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `prospectingSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icpId` int NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`maxResults` int NOT NULL DEFAULT 10,
	`autoCreateCompanies` int NOT NULL DEFAULT 1,
	`isActive` int NOT NULL DEFAULT 1,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prospectingSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `blogPosts` (`slug`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `blogPosts` (`authorId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `blogPosts` (`status`);--> statement-breakpoint
CREATE INDEX `icp_idx` ON `prospectingSchedules` (`icpId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `prospectingSchedules` (`ownerId`);