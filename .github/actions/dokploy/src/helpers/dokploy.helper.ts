import * as core from '@actions/core';
import {
  applicationCreate,
  applicationOne,
  domainByApplicationId,
  domainCreate,
  projectOne,
  serverPublicIp,
} from '../sdk/client';
import type { Application, Domain, Project } from '../sdk/types';
import { toKebabCase } from '../utils/string';

export async function getOrCreateApplication({
  applicationId,
  applicationName,
  projectId,
  dockerPort,
}: {
  applicationId: string;
  applicationName: string;
  projectId: string;
  dockerPort: string;
}) {
  const { application: existingApplication, project } = await getApplication({
    applicationId,
    applicationName,
    projectId,
  });

  if (existingApplication) {
    return existingApplication;
  }

  core.info(`Creating application ${applicationName}...`);
  const { data: application } = await applicationCreate({
    body: {
      projectId,
      name: applicationName,
      appName: applicationName,
    },
  });
  if (application) {
    const domain = await generateDomain({
      appName: (application as Application).name,
      projectName: (project as Project).name,
    });

    await domainCreate({
      body: {
        host: domain,
        applicationId: (application as Application).applicationId,
        https: true,
        certificateType: 'letsencrypt',
        port: Number.parseInt(dockerPort ?? '80'),
      },
    });
    return application as Application;
  }
}

export async function getApplication({
  applicationId,
  applicationName,
  projectId,
}: {
  applicationId: string;
  applicationName: string;
  projectId: string;
}) {
  if (applicationId) {
    const { data: application } = await applicationOne({
      query: { applicationId },
    });

    if (application) {
      core.info(`Application ${applicationName} found`);
      return {
        application: application as Application,
      };
    }
  }

  const { data: project } = await projectOne({
    query: { projectId },
  });

  if (!project) {
    return {
      application: undefined,
      project: undefined,
    };
  }

  for (const application of (project as Project).applications) {
    if (application.name === applicationName) {
      core.info(`Application ${applicationName} found`);
      return {
        application,
      };
    }
  }

  return {
    project: project as Project,
  };
}

async function generateDomain({
  appName,
  projectName,
  domain = 'sslip.io',
}: {
  appName: string;
  projectName: string;
  domain?: string;
}) {
  const subdomain = toKebabCase(`${projectName}-${appName}`);

  if (domain === 'sslip.io') {
    const { data: publicIp } = await serverPublicIp();
    return `${subdomain}.${(publicIp as string).replace(/\./g, '-')}.${domain}`;
  }

  return `${subdomain}.${domain}`;
}

export async function waitForDeploymentToBeDone(applicationId: string) {
  const res = await applicationOne({
    query: { applicationId },
  });
  const application = res.data as Application | undefined;
  if (!application) {
    throw new Error('Application not found');
  }
  if (application.applicationStatus === 'error') {
    throw new Error('Application deployment failed');
  }
  if (application.applicationStatus === 'done') {
    return;
  }

  // wait for 5 seconds before checking again
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await waitForDeploymentToBeDone(applicationId);
}

export async function getApplicationUrl(applicationId: string) {
  const { data } = await domainByApplicationId({
    query: { applicationId },
  });
  return `https://${(data as Domain[])[0].host}`;
}
