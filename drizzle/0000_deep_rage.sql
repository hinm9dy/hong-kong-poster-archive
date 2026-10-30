CREATE TABLE `posters` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`designer` text NOT NULL,
	`year` integer NOT NULL,
	`email` text NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	CONSTRAINT "valid_status" CHECK("posters"."status" in ('pending','selected','published','rejected'))
);
--> statement-breakpoint
CREATE INDEX `posters_status_year` ON `posters` (`status`,`year`);--> statement-breakpoint
CREATE TABLE `upload_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
