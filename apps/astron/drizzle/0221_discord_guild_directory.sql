CREATE TABLE "discord_guild" (
	"guild_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"owner_id" text,
	"approximate_member_count" integer,
	"verification_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "discord_guild_name_idx" ON "discord_guild" USING btree ("name");--> statement-breakpoint
CREATE TABLE "discord_guild_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"guild_id" text NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"permissions" text NOT NULL,
	"can_manage" boolean DEFAULT false NOT NULL,
	"membership_state" text DEFAULT 'active' NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discord_guild_membership" ADD CONSTRAINT "discord_guild_membership_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_membership" ADD CONSTRAINT "discord_guild_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_membership" ADD CONSTRAINT "discord_guild_membership_guild_id_discord_guild_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."discord_guild"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "discord_guild_membership_account_guild_uq" ON "discord_guild_membership" USING btree ("account_id","guild_id");--> statement-breakpoint
CREATE INDEX "discord_guild_membership_user_state_idx" ON "discord_guild_membership" USING btree ("user_id","membership_state");--> statement-breakpoint
CREATE INDEX "discord_guild_membership_guild_idx" ON "discord_guild_membership" USING btree ("guild_id");--> statement-breakpoint
CREATE TABLE "discord_guild_sync_state" (
	"account_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"last_attempt_at" timestamp,
	"last_successful_sync_at" timestamp,
	"last_error" text,
	"error_code" text,
	"guild_count" integer DEFAULT 0 NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discord_guild_sync_state" ADD CONSTRAINT "discord_guild_sync_state_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_sync_state" ADD CONSTRAINT "discord_guild_sync_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "discord_guild_installation" (
	"guild_id" text NOT NULL,
	"product_id" text NOT NULL,
	"installed" boolean DEFAULT true NOT NULL,
	"runtime_state" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discord_guild_installation_guild_id_product_id_pk" PRIMARY KEY("guild_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "discord_guild_installation" ADD CONSTRAINT "discord_guild_installation_guild_id_discord_guild_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."discord_guild"("guild_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "discord_guild_installation_product_idx" ON "discord_guild_installation" USING btree ("product_id");
