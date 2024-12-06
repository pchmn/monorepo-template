import * as core from '@actions/core';
import * as github from '@actions/github';
import { getConfig } from './config';
import { setPullRequestComment } from './github/comment-pr';
import {
  getApplication,
  getApplicationUrl,
  getOrCreateApplication,
  waitForDeploymentToBeDone,
} from './helpers/dokploy.helper';
import {
  applicationDelete,
  applicationDeploy,
  applicationSaveDockerProvider,
  applicationSaveEnvironment,
  client,
} from './sdk/client';

const config = getConfig();
let octokit: ReturnType<typeof github.getOctokit>;
if (config.githubToken) {
  octokit = github.getOctokit(config.githubToken);
}
client.setConfig({
  baseUrl: `${config.dokployBaseUrl}/api`,
  headers: {
    Authorization: `Bearer ${config.dokployToken}`,
  },
});

async function main() {
  try {
    if (config.action === 'deploy') {
      await deploy();
    } else {
      await destroy();
    }
  } catch (error) {
    core.error(error.stack);
    core.setFailed(error.message);
  }
}

async function deploy() {
  const application = await getOrCreateApplication({
    applicationId: config.applicationId,
    applicationName: config.applicationName,
    projectId: config.projectId,
    dockerPort: config.dockerPort,
  });
  core.debug(`Application: ${JSON.stringify(application, null, 2)}`);

  if (application) {
    core.info(`Updating docker image of ${application.name}...`);
    await applicationSaveDockerProvider({
      body: {
        applicationId: application.applicationId,
        dockerImage: config.dockerImage,
        username: config.dockerUsername,
        password: config.dockerPassword,
      },
    });

    core.info(`Updating environment variables of ${application.name}...`);
    await applicationSaveEnvironment({
      body: {
        applicationId: application.applicationId,
        env: config.env.join('\n'),
      },
    });

    core.info(`Deploying ${application.name}...`);
    await applicationDeploy({
      parseAs: 'text',
      body: { applicationId: application.applicationId },
    });

    core.debug('Waiting for deployment to be done...');
    await waitForDeploymentToBeDone(application.applicationId);

    const applicationUrl = await getApplicationUrl(application.applicationId);
    if (config.commentPr) {
      core.debug('Setting pull request comment...');
      await setPullRequestComment(octokit, {
        appName: application.name,
        appUrl: applicationUrl,
        appSettingsUrl: `${config.dokployBaseUrl}/dashboard/project/${config.projectId}/services/application/${application.applicationId}`,
      });
    }

    core.info(
      `🚀 ${application.name} successfully deployed to ${applicationUrl}`,
    );
  }
}

async function destroy() {
  core.info('Destroying application...');

  const { application } = await getApplication({
    applicationId: config.applicationId,
    applicationName: config.applicationName,
    projectId: config.projectId,
  });

  if (!application) {
    core.setFailed('Application not found');
    return;
  }

  await applicationDelete({
    body: { applicationId: application.applicationId },
  });
  core.info(`Application ${application.name} successfuly destroyed`);
}

main();
