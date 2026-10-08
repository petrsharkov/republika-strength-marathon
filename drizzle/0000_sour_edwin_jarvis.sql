CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`last_name` text DEFAULT '' NOT NULL,
	`first_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`registration_key` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`body_weight` real,
	`bar_weight` real,
	`bench` integer,
	`pullups` integer,
	`dips` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`field_times` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_participants_registration_key` ON `participants` (`registration_key`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
