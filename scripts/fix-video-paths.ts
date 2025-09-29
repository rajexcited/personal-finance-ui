import * as fs from 'fs';
import * as path from 'path';

/**
 * Post-processes Mochawesome reports to fix video paths on Windows
 * Converts paths like "videos\\cypress\\e2e\\folder/file.cy.ts.mp4" 
 * to "videos/folder/file.cy.ts.mp4"
 */
export function fixVideoPathsInReport(reportDir: string): void {
    console.log('Processing report directory:', reportDir);
    const jsonFile = path.join(reportDir, 'index.json');
    const htmlFile = path.join(reportDir, 'index.html');
    
    if (!fs.existsSync(jsonFile)) {
        console.log('No JSON report found at:', jsonFile);
        return;
    }
    
    try {
        // Fix JSON report
        let jsonContent = fs.readFileSync(jsonFile, 'utf8');
        const originalContent = jsonContent;
        
        // Replace video paths in context sections
        // The paths are in escaped JSON strings, so we need to match the double-escaped backslashes
        jsonContent = jsonContent.replace(
            /"videos\\\\\\\\cypress\\\\\\\\e2e\\\\\\\\([^"]+)"/g,
            '"videos/$1"'
        );
        
        // Also handle forward slash variants  
        jsonContent = jsonContent.replace(
            /"videos\/cypress\/e2e\/([^"]+)"/g,
            '"videos/$1"'
        );
        
        // Fix remaining backslashes in video paths to forward slashes
        jsonContent = jsonContent.replace(
            /"videos\\\\([^"]+)"/g,
            '"videos/$1"'
        );
        
        console.log('Applied replacements to JSON content');
        
        if (jsonContent !== originalContent) {
            fs.writeFileSync(jsonFile, jsonContent, 'utf8');
            console.log('Fixed video paths in JSON report:', jsonFile);
        }
        
        // Fix HTML report if it exists
        if (fs.existsSync(htmlFile)) {
            let htmlContent = fs.readFileSync(htmlFile, 'utf8');
            const originalHtmlContent = htmlContent;
            
            // Replace video paths in HTML
            htmlContent = htmlContent.replace(
                /videos\\\\\\\\cypress\\\\\\\\e2e\\\\\\\\([^\&quot;]+)/g,
                'videos/$1'
            );

            htmlContent = htmlContent.replace(
                /videos\/cypress\/e2e\/([^"']+)/g,
                'videos/$1'
            );
            
            if (htmlContent !== originalHtmlContent) {
                fs.writeFileSync(htmlFile, htmlContent, 'utf8');
                console.log('Fixed video paths in HTML report:', htmlFile);
            }
        }
        
    } catch (error) {
        console.error('Error fixing video paths:', error);
    }
}

// If run directly, use command line argument
if (require.main === module) {
    const reportDir = process.argv[2];
    if (!reportDir) {
        console.error('Usage: ts-node fix-video-paths.ts <report-directory>');
        process.exit(1);
    }
    fixVideoPathsInReport(reportDir);
}
