export const workspaceTourSteps = [
    {
        target: '[data-tour="workspace-library"]',
        content: "This is where your available workspaces appear.",
        disableBeacon: true
    },
    {
        target: '[data-tour="workspace-card-first"]',
        content: "You can switch the active workspace from here.",
        disableBeacon: true
    },
    {
        target: '[data-tour="create-link-entry"]',
        content: "After choosing a workspace, create your first short link from here.",
        disableBeacon: true
    }
];

export const linkTourSteps = [
    {
        target: '[data-tour="links-table"]',
        content: "This is your link library. Every short link you create appears here.",
        disableBeacon: true
    },
    {
        target: '[data-tour="link-row-first"]',
        content: "This is your newest link. Review its status, slug, and clicks here.",
        disableBeacon: true
    },
    {
        target: '[data-tour="link-row-actions-first"]',
        content: "Use these actions to copy, edit, pause, or inspect the link in more detail.",
        disableBeacon: true
    },
    {
        target: '[data-tour="dashboard-summary"]',
        content: "Your dashboard gives you a broader view of traffic and performance.",
        disableBeacon: true
    }
];

export const domainTourSteps = [
    {
        target: '[data-tour="domains-list"]',
        content: "Your custom domains appear here once they are added.",
        disableBeacon: true
    },
    {
        target: '[data-tour="domain-row-first"]',
        content: "This is your first domain. Open it to manage verification and DNS setup.",
        disableBeacon: true
    },
    {
        target: '[data-tour="domain-dns-records"]',
        content: "Add these DNS records in your provider exactly as shown.",
        disableBeacon: true
    },
    {
        target: '[data-tour="domain-verify-button"]',
        content: "Once DNS propagation is complete, click here to verify the domain.",
        disableBeacon: true
    }
];

export const dashboardTourSteps = [
    {
        target: '[data-tour="dashboard-summary"]',
        content: "These cards and insights give you a quick overview of workspace performance.",
        disableBeacon: true
    },
    {
        target: '[data-tour="dashboard-top-links"]',
        content: "This section highlights your most active links.",
        disableBeacon: true
    },
    {
        target: '[data-tour="dashboard-recent-activity"]',
        content: "Recent activity helps you quickly review newly created links.",
        disableBeacon: true
    }
];


export function getStepsForTour(tourName) {
    if (tourName === "workspace") return workspaceTourSteps;
    if (tourName === "link") return linkTourSteps;
    if (tourName === "domain") return domainTourSteps;
    if (tourName === "dashboard") return dashboardTourSteps;
    return [];
}