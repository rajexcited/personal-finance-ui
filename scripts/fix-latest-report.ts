import * as fs from 'fs';
import * as path from 'path';
import { fixVideoPathsInReport } from './fix-video-paths';

const reportsDir = 'cypress/reports';

// Find the latest timestamped report directory
const dirs = fs.readdirSync(reportsDir)
    .filter((d: string) => {
        const fullPath = path.join(reportsDir, d);
        return fs.statSync(fullPath).isDirectory() && /^\d{8}_\d{6}$/.test(d);
    })
    .sort()
    .reverse();

if (dirs.length > 0) {
    const latestReportPath = path.join(reportsDir, dirs[0]);
    console.log('Fixing video paths in latest report:', latestReportPath);
    fixVideoPathsInReport(latestReportPath);
} else {
    console.log('No timestamped report directories found in', reportsDir);
}
