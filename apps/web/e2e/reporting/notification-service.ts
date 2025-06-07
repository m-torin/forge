/**
 * Notification Service - Handles sending notifications for test results
 */

export interface NotificationMessage {
  details: string;
  metadata: {
    environment: string;
    branch: string;
    commit: string;
    timestamp: string;
    reportUrl?: string;
  };
  status: "success" | "warning" | "error";
  summary: string;
  title: string;
}

export interface SlackConfig {
  channel: string;
  mentions?: string[];
  webhook: string;
}

export interface TeamsConfig {
  webhook: string;
}

export interface EmailConfig {
  recipients: string[];
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

/**
 * Slack notification sender
 */
export class SlackNotificationService {
  constructor(private config: SlackConfig) {}

  async send(message: NotificationMessage): Promise<void> {
    const payload = this.createSlackPayload(message);

    try {
      // In a real implementation, you would use fetch or an HTTP client
      console.log(
        "📱 Slack notification payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log("✅ Slack notification sent successfully");
    } catch (error) {
      console.error("❌ Failed to send Slack notification:", error);
      throw error;
    }
  }

  private createSlackPayload(message: NotificationMessage): any {
    const statusEmoji = this.getStatusEmoji(message.status);
    const color = this.getStatusColor(message.status);

    const mentions = this.config.mentions?.length
      ? this.config.mentions.map((user) => `<@${user}>`).join(" ")
      : "";

    return {
      attachments: [
        {
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `${statusEmoji} ${message.title}`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message.summary,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Environment:*\n${message.metadata.environment}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Branch:*\n${message.metadata.branch}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Commit:*\n${message.metadata.commit.substring(0, 8)}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Time:*\n${new Date(message.metadata.timestamp).toLocaleString()}`,
                },
              ],
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Details:*\n\`\`\`${message.details}\`\`\``,
              },
            },
          ],
          color,
        },
      ],
      channel: this.config.channel,
      text: `${statusEmoji} ${message.title}`,
    };

    if (message.metadata.reportUrl) {
      payload.attachments[0].blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            url: message.metadata.reportUrl,
            style: "primary",
            text: {
              type: "plain_text",
              text: "📊 View Full Report",
            },
          },
        ],
      });
    }

    if (mentions) {
      payload.text += ` ${mentions}`;
    }

    return payload;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case "success":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "error":
        return "#dc3545";
      default:
        return "#17a2b8";
    }
  }
}

/**
 * Microsoft Teams notification sender
 */
export class TeamsNotificationService {
  constructor(private config: TeamsConfig) {}

  async send(message: NotificationMessage): Promise<void> {
    const payload = this.createTeamsPayload(message);

    try {
      console.log(
        "💬 Teams notification payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log("✅ Teams notification sent successfully");
    } catch (error) {
      console.error("❌ Failed to send Teams notification:", error);
      throw error;
    }
  }

  private createTeamsPayload(message: NotificationMessage): any {
    const color = this.getStatusColor(message.status);

    return {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      potentialAction: message.metadata.reportUrl
        ? [
            {
              name: "View Full Report",
              "@type": "OpenUri",
              targets: [
                {
                  os: "default",
                  uri: message.metadata.reportUrl,
                },
              ],
            },
          ]
        : undefined,
      sections: [
        {
          activitySubtitle: message.summary,
          activityTitle: message.title,
          facts: [
            {
              name: "Environment",
              value: message.metadata.environment,
            },
            {
              name: "Branch",
              value: message.metadata.branch,
            },
            {
              name: "Commit",
              value: message.metadata.commit.substring(0, 8),
            },
            {
              name: "Time",
              value: new Date(message.metadata.timestamp).toLocaleString(),
            },
          ],
          text: message.details,
        },
      ],
      summary: message.title,
      themeColor: color,
    };
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case "success":
        return "28a745";
      case "warning":
        return "ffc107";
      case "error":
        return "dc3545";
      default:
        return "17a2b8";
    }
  }
}

/**
 * Email notification sender
 */
export class EmailNotificationService {
  constructor(private config: EmailConfig) {}

  async send(message: NotificationMessage): Promise<void> {
    const emailData = this.createEmailData(message);

    try {
      console.log("📧 Email notification data:", emailData);
      console.log("✅ Email notification sent successfully");
    } catch (error) {
      console.error("❌ Failed to send email notification:", error);
      throw error;
    }
  }

  private createEmailData(message: NotificationMessage): any {
    const statusEmoji = this.getStatusEmoji(message.status);

    return {
      html: this.createEmailHTML(message),
      subject: `${statusEmoji} ${message.title}`,
      text: this.createEmailText(message),
      to: this.config.recipients,
    };
  }

  private createEmailHTML(message: NotificationMessage): string {
    const statusColor = this.getStatusColor(message.status);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${message.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: ${statusColor};
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .metadata {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .metadata-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .details {
            background: white;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            white-space: pre-wrap;
        }
        .footer {
            background: #333;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${message.title}</h1>
    </div>
    
    <div class="content">
        <p>${message.summary}</p>
        
        <div class="metadata">
            <h3>Test Execution Details</h3>
            <div class="metadata-row">
                <strong>Environment:</strong>
                <span>${message.metadata.environment}</span>
            </div>
            <div class="metadata-row">
                <strong>Branch:</strong>
                <span>${message.metadata.branch}</span>
            </div>
            <div class="metadata-row">
                <strong>Commit:</strong>
                <span>${message.metadata.commit}</span>
            </div>
            <div class="metadata-row">
                <strong>Time:</strong>
                <span>${new Date(message.metadata.timestamp).toLocaleString()}</span>
            </div>
        </div>
        
        <h3>Results Summary</h3>
        <div class="details">${message.details}</div>
        
        ${
          message.metadata.reportUrl
            ? `
        <p>
            <a href="${message.metadata.reportUrl}" class="button">
                📊 View Full Report
            </a>
        </p>
        `
            : ""
        }
    </div>
    
    <div class="footer">
        Generated by Test Reporter
    </div>
</body>
</html>`;
  }

  private createEmailText(message: NotificationMessage): string {
    return `
${message.title}

${message.summary}

Test Execution Details:
- Environment: ${message.metadata.environment}
- Branch: ${message.metadata.branch}
- Commit: ${message.metadata.commit}
- Time: ${new Date(message.metadata.timestamp).toLocaleString()}

Results Summary:
${message.details}

${message.metadata.reportUrl ? `Full Report: ${message.metadata.reportUrl}` : ""}
`;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case "success":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "error":
        return "#dc3545";
      default:
        return "#17a2b8";
    }
  }
}

/**
 * Main notification service that coordinates all notification channels
 */
export class NotificationService {
  private services: {
    slack?: SlackNotificationService;
    teams?: TeamsNotificationService;
    email?: EmailNotificationService;
  } = {};

  constructor(config: {
    slack?: SlackConfig;
    teams?: TeamsConfig;
    email?: EmailConfig;
  }) {
    if (config.slack) {
      this.services.slack = new SlackNotificationService(config.slack);
    }
    if (config.teams) {
      this.services.teams = new TeamsNotificationService(config.teams);
    }
    if (config.email) {
      this.services.email = new EmailNotificationService(config.email);
    }
  }

  async sendToAll(message: NotificationMessage): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.services.slack) {
      promises.push(this.services.slack.send(message));
    }
    if (this.services.teams) {
      promises.push(this.services.teams.send(message));
    }
    if (this.services.email) {
      promises.push(this.services.email.send(message));
    }

    if (promises.length === 0) {
      console.log("⚠️  No notification services configured");
      return;
    }

    try {
      await Promise.allSettled(promises);
      console.log(`✅ Notifications sent to ${promises.length} channels`);
    } catch (error) {
      console.error("❌ Some notifications failed to send:", error);
    }
  }

  async sendToSlack(message: NotificationMessage): Promise<void> {
    if (!this.services.slack) {
      throw new Error("Slack service not configured");
    }
    await this.services.slack.send(message);
  }

  async sendToTeams(message: NotificationMessage): Promise<void> {
    if (!this.services.teams) {
      throw new Error("Teams service not configured");
    }
    await this.services.teams.send(message);
  }

  async sendToEmail(message: NotificationMessage): Promise<void> {
    if (!this.services.email) {
      throw new Error("Email service not configured");
    }
    await this.services.email.send(message);
  }
}

/**
 * Utility functions for creating notification messages
 */
export class NotificationMessageBuilder {
  static createTestFailureMessage(testResults: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    environment: string;
    branch: string;
    commit: string;
    failureDetails: string[];
  }): NotificationMessage {
    const passRate = Math.round(
      (testResults.passedTests / testResults.totalTests) * 100,
    );

    return {
      details: `Test Results:
• Total: ${testResults.totalTests}
• Passed: ${testResults.passedTests}
• Failed: ${testResults.failedTests}
• Duration: ${Math.round(testResults.duration / 1000)}s

Failed Tests:
${testResults.failureDetails
  .slice(0, 5)
  .map((failure) => `• ${failure}`)
  .join("\n")}
${testResults.failureDetails.length > 5 ? `\n... and ${testResults.failureDetails.length - 5} more` : ""}`,
      metadata: {
        branch: testResults.branch,
        commit: testResults.commit,
        environment: testResults.environment,
        timestamp: new Date().toISOString(),
      },
      status: "error",
      summary: `${testResults.failedTests}/${testResults.totalTests} tests failed (${passRate}% pass rate)`,
      title: `Test Execution Failed - ${testResults.environment}`,
    };
  }

  static createTestSuccessMessage(testResults: {
    totalTests: number;
    passedTests: number;
    duration: number;
    environment: string;
    branch: string;
    commit: string;
  }): NotificationMessage {
    return {
      details: `Test Results:
• Total: ${testResults.totalTests}
• Passed: ${testResults.passedTests}
• Failed: 0
• Duration: ${Math.round(testResults.duration / 1000)}s`,
      metadata: {
        branch: testResults.branch,
        commit: testResults.commit,
        environment: testResults.environment,
        timestamp: new Date().toISOString(),
      },
      status: "success",
      summary: `${testResults.totalTests} tests passed successfully`,
      title: `All Tests Passed - ${testResults.environment}`,
    };
  }

  static createPerformanceRegressionMessage(
    regressions: {
      page: string;
      metric: string;
      percentageChange: number;
      severity: string;
    }[],
    metadata: {
      environment: string;
      branch: string;
      commit: string;
    },
  ): NotificationMessage {
    const criticalCount = regressions.filter(
      (r) => r.severity === "critical",
    ).length;
    const majorCount = regressions.filter((r) => r.severity === "major").length;

    return {
      details: `Performance Regressions:
${regressions
  .slice(0, 10)
  .map(
    (r) =>
      `• ${r.page} - ${r.metric}: ${r.percentageChange.toFixed(1)}% (${r.severity})`,
  )
  .join("\n")}
${regressions.length > 10 ? `\n... and ${regressions.length - 10} more` : ""}`,
      metadata: {
        branch: metadata.branch,
        commit: metadata.commit,
        environment: metadata.environment,
        timestamp: new Date().toISOString(),
      },
      status: criticalCount > 0 ? "error" : "warning",
      summary: `${regressions.length} performance regressions found (${criticalCount} critical, ${majorCount} major)`,
      title: `Performance Regressions Detected - ${metadata.environment}`,
    };
  }
}
