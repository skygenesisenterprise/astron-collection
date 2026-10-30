import { db } from "@astron-collection/server/db";
import { notifications } from "@astron-collection/server/db/schema";
import AstronCollectionRestartEmail from "@astron-collection/server/emails/emails/astron-collection-restart";
import { render } from "@react-email/components";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import {
	sendCustomNotification,
	sendDiscordNotification,
	sendEmailNotification,
	sendGotifyNotification,
	sendLarkNotification,
	sendMattermostNotification,
	sendNtfyNotification,
	sendPushoverNotification,
	sendResendNotification,
	sendSlackNotification,
	sendTeamsNotification,
	sendTelegramNotification,
} from "./utils";

export const sendAstronCollectionRestartNotifications = async () => {
	try {
		const date = new Date();
		const unixDate = ~~(Number(date) / 1000);
		const notificationList = await db.query.notifications.findMany({
			where: eq(notifications.astronCollectionRestart, true),
			with: {
				email: true,
				discord: true,
				telegram: true,
				slack: true,
				resend: true,
				gotify: true,
				ntfy: true,
				mattermost: true,
				custom: true,
				lark: true,
				pushover: true,
				teams: true,
			},
		});

		for (const notification of notificationList) {
			const {
				email,
				resend,
				discord,
				telegram,
				slack,
				gotify,
				ntfy,
				mattermost,
				custom,
				lark,
				pushover,
				teams,
			} = notification;

			try {
				if (email || resend) {
					const template = await render(
						AstronCollectionRestartEmail({ date: date.toLocaleString() }),
					).catch();

					if (email) {
						await sendEmailNotification(
							email,
							"Astron Collection Server Restarted",
							template,
						);
					}

					if (resend) {
						await sendResendNotification(
							resend,
							"Astron Collection Server Restarted",
							template,
						);
					}
				}

				if (discord) {
					const decorate = (decoration: string, text: string) =>
						`${discord.decoration ? decoration : ""} ${text}`.trim();

					await sendDiscordNotification(discord, {
						title: decorate(">", "`✅` Astron Collection Server Restarted"),
						color: 0x57f287,
						fields: [
							{
								name: decorate("`📅`", "Date"),
								value: `<t:${unixDate}:D>`,
								inline: true,
							},
							{
								name: decorate("`⌚`", "Time"),
								value: `<t:${unixDate}:t>`,
								inline: true,
							},
							{
								name: decorate("`❓`", "Type"),
								value: "Successful",
								inline: true,
							},
						],
						timestamp: date.toISOString(),
						footer: {
							text: "Astron Collection Restart Notification",
						},
					});
				}

				if (gotify) {
					const decorate = (decoration: string, text: string) =>
						`${gotify.decoration ? decoration : ""} ${text}\n`;
					await sendGotifyNotification(
						gotify,
						decorate("✅", "Astron Collection Server Restarted"),
						`${decorate("🕒", `Date: ${date.toLocaleString()}`)}`,
					);
				}

				if (ntfy) {
					await sendNtfyNotification(
						ntfy,
						"Astron Collection Server Restarted",
						"white_check_mark",
						"",
						`🕒Date: ${date.toLocaleString()}`,
					);
				}

				if (telegram) {
					await sendTelegramNotification(
						telegram,
						`<b>✅ Astron Collection Server Restarted</b>\n\n<b>Date:</b> ${format(
							date,
							"PP",
						)}\n<b>Time:</b> ${format(date, "pp")}`,
					);
				}

				if (slack) {
					const { channel } = slack;
					await sendSlackNotification(slack, {
						channel: channel,
						attachments: [
							{
								color: "#00FF00",
								pretext: ":white_check_mark: *Astron Collection Server Restarted*",
								fields: [
									{
										title: "Time",
										value: date.toLocaleString(),
										short: true,
									},
								],
							},
						],
					});
				}

				if (mattermost) {
					await sendMattermostNotification(mattermost, {
						text: `**✅ Astron Collection Server Restarted**\n\n**Date:** ${format(date, "PP")}\n**Time:** ${format(date, "pp")}`,
						channel: mattermost.channel,
						username: mattermost.username || "Astron Collection",
					});
				}

				if (custom) {
					try {
						await sendCustomNotification(custom, {
							title: "Astron Collection Server Restarted",
							message: "Astron Collection server has been restarted successfully",
							timestamp: date.toISOString(),
							date: date.toLocaleString(),
							status: "success",
							type: "astron-collection-restart",
						});
					} catch (error) {
						console.log(error);
					}
				}

				if (lark) {
					await sendLarkNotification(lark, {
						msg_type: "interactive",
						card: {
							schema: "2.0",
							config: {
								update_multi: true,
								style: {
									text_size: {
										normal_v2: {
											default: "normal",
											pc: "normal",
											mobile: "heading",
										},
									},
								},
							},
							header: {
								title: {
									tag: "plain_text",
									content: "✅ Astron Collection Server Restarted",
								},
								subtitle: {
									tag: "plain_text",
									content: "",
								},
								template: "green",
								padding: "12px 12px 12px 12px",
							},
							body: {
								direction: "vertical",
								padding: "12px 12px 12px 12px",
								elements: [
									{
										tag: "column_set",
										columns: [
											{
												tag: "column",
												width: "weighted",
												elements: [
													{
														tag: "markdown",
														content: "**Status:**\nSuccessful",
														text_align: "left",
														text_size: "normal_v2",
													},
												],
												vertical_align: "top",
												weight: 1,
											},
											{
												tag: "column",
												width: "weighted",
												elements: [
													{
														tag: "markdown",
														content: `**Restart Time:**\n${format(
															date,
															"PP pp",
														)}`,
														text_align: "left",
														text_size: "normal_v2",
													},
												],
												vertical_align: "top",
												weight: 1,
											},
										],
									},
								],
							},
						},
					});
				}

				if (pushover) {
					await sendPushoverNotification(
						pushover,
						"Astron Collection Server Restarted",
						`Date: ${date.toLocaleString()}`,
					);
				}

				if (teams) {
					await sendTeamsNotification(teams, {
						title: "✅ Astron Collection Server Restarted",
						facts: [
							{ name: "Status", value: "Successful" },
							{ name: "Restart Time", value: format(date, "PP pp") },
						],
					});
				}
			} catch (error) {
				console.log(error);
			}
		}
	} catch (error) {
		console.error("[Astron Collection] Restart notifications failed:", error);
	}
};
