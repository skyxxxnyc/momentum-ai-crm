CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('call','email','meeting','note','task','deal_update') NOT NULL,
	`subject` varchar(255),
	`description` text,
	`dealId` int,
	`contactId` int,
	`companyId` int,
	`userId` int NOT NULL,
	`activityDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text,
	`excerpt` text,
	`type` enum('blog','case_study','whitepaper','proposal','battle_card','one_pager') NOT NULL DEFAULT 'blog',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`authorId` int NOT NULL,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`domain` varchar(255),
	`website` text,
	`industry` varchar(255),
	`size` varchar(100),
	`description` text,
	`logo` text,
	`address` text,
	`city` varchar(255),
	`state` varchar(100),
	`country` varchar(100),
	`zipCode` varchar(20),
	`phone` varchar(50),
	`linkedinUrl` text,
	`twitterUrl` text,
	`relationshipStrength` int DEFAULT 0,
	`aiSummary` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`title` varchar(255),
	`companyId` int,
	`linkedinUrl` text,
	`twitterUrl` text,
	`avatar` text,
	`address` text,
	`city` varchar(255),
	`state` varchar(100),
	`country` varchar(100),
	`zipCode` varchar(20),
	`relationshipStrength` int DEFAULT 0,
	`lastContactedAt` timestamp,
	`notes` text,
	`referredBy` int,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deal_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deal_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`value` int DEFAULT 0,
	`stage` enum('lead','qualified','proposal','negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'lead',
	`probability` int DEFAULT 0,
	`expectedCloseDate` timestamp,
	`actualCloseDate` timestamp,
	`companyId` int,
	`contactId` int,
	`ownerId` int NOT NULL,
	`momentumScore` int DEFAULT 0,
	`dealHealth` enum('healthy','at_risk','stale','critical') DEFAULT 'healthy',
	`lastActivityAt` timestamp,
	`isHot` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_sequence_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceId` int NOT NULL,
	`contactId` int NOT NULL,
	`currentStep` int DEFAULT 0,
	`status` enum('active','completed','unsubscribed') NOT NULL DEFAULT 'active',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_sequence_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_sequence_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceId` int NOT NULL,
	`stepNumber` int NOT NULL,
	`subject` varchar(500),
	`body` text,
	`delayDays` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_sequence_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_sequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('revenue','deals','activities','custom') NOT NULL DEFAULT 'revenue',
	`targetValue` int NOT NULL,
	`currentValue` int DEFAULT 0,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`industry` varchar(255),
	`companySize` varchar(100),
	`revenue` varchar(100),
	`geography` varchar(255),
	`techStack` text,
	`painPoints` text,
	`buyingSignals` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `icps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`title` varchar(255),
	`source` varchar(255),
	`status` enum('new','contacted','qualified','unqualified','converted') NOT NULL DEFAULT 'new',
	`score` int DEFAULT 0,
	`icpId` int,
	`notes` text,
	`ownerId` int NOT NULL,
	`convertedToContactId` int,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('stale_deal','hot_lead','task_due','ai_suggestion','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','completed','cancelled') NOT NULL DEFAULT 'todo',
	`dealId` int,
	`contactId` int,
	`companyId` int,
	`assignedTo` int NOT NULL,
	`createdBy` int NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `title` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(255);--> statement-breakpoint
CREATE INDEX `deal_idx` ON `activities` (`dealId`);--> statement-breakpoint
CREATE INDEX `contact_idx` ON `activities` (`contactId`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `activities` (`companyId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `activities` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `ai_chat_messages` (`userId`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `ai_chat_messages` (`sessionId`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `articles` (`authorId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `articles` (`type`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `companies` (`ownerId`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `contacts` (`companyId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `contacts` (`ownerId`);--> statement-breakpoint
CREATE INDEX `deal_idx` ON `deal_comments` (`dealId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `deal_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `deals` (`companyId`);--> statement-breakpoint
CREATE INDEX `contact_idx` ON `deals` (`contactId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `deals` (`ownerId`);--> statement-breakpoint
CREATE INDEX `stage_idx` ON `deals` (`stage`);--> statement-breakpoint
CREATE INDEX `sequence_idx` ON `email_sequence_enrollments` (`sequenceId`);--> statement-breakpoint
CREATE INDEX `contact_idx` ON `email_sequence_enrollments` (`contactId`);--> statement-breakpoint
CREATE INDEX `sequence_idx` ON `email_sequence_steps` (`sequenceId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `email_sequences` (`ownerId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `goals` (`userId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `icps` (`ownerId`);--> statement-breakpoint
CREATE INDEX `icp_idx` ON `leads` (`icpId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `leads` (`ownerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `deal_idx` ON `tasks` (`dealId`);--> statement-breakpoint
CREATE INDEX `contact_idx` ON `tasks` (`contactId`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `tasks` (`companyId`);--> statement-breakpoint
CREATE INDEX `assigned_idx` ON `tasks` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);