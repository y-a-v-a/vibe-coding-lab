#!/bin/bash

# Generate index.html for all projects in public directory
PUBLIC_DIR="public"
INDEX_FILE="$PUBLIC_DIR/index.html"

# Start HTML document
cat > "$INDEX_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Coding Lab - Projects</title>
    <link rel="icon" href="data:,">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            color: white;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .projects-grid {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .project-card {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .project-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
        }
        
        .project-card h2 {
            color: white;
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }
        
        .project-card p {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .project-card a {
            display: inline-block;
            background: linear-gradient(45deg, #ff6b6b, #ffa726);
            color: white;
            text-decoration: none;
            padding: 0.7rem 1.5rem;
            border-radius: 25px;
            font-weight: 500;
            transition: transform 0.2s ease;
        }
        
        .project-card a:hover {
            transform: scale(1.05);
        }
        
        .footer {
            text-align: center;
            margin-top: 2rem;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Vibe Coding Lab</h1>
        <div class="projects-grid">
EOF

# Find all directories in public (excluding . and ..)
for project_dir in "$PUBLIC_DIR"/*; do
    if [ -d "$project_dir" ]; then
        project_name=$(basename "$project_dir")
        index_file="$project_dir/index.html"
        
        if [ -f "$index_file" ]; then
            # Extract title from HTML file
            title=$(grep -i '<title>' "$index_file" | head -1 | sed 's/<[^>]*>//g' | xargs)
            
            # If no title found, use directory name
            if [ -z "$title" ]; then
                title="$project_name"
            fi
            
            # Check for README.md and extract copyright
            readme_file="$project_dir/README.md"
            copyright=""
            if [ -f "$readme_file" ]; then
                copyright=$(grep "^(c)" "$readme_file" | head -1)
            fi
            
            # Add project card to index
            cat >> "$INDEX_FILE" << EOF
            <div class="project-card">
                <h2>$title</h2>
                <p>Project: $project_name</p>
                $(if [ -n "$copyright" ]; then echo "<p style=\"font-size: 0.8rem; color: rgba(255, 255, 255, 0.6);\">$copyright</p>"; fi)
                <a href="$project_name/">View Project →</a>
            </div>
EOF
        fi
    fi
done

# Close HTML document
cat >> "$INDEX_FILE" << 'EOF'
        </div>
        <div class="footer">
            <p>Generated automatically • Vibe Coded Projects</p>
        </div>
    </div>
</body>
</html>
EOF

echo "Generated index.html with $(find "$PUBLIC_DIR" -maxdepth 1 -type d | wc -l | xargs) projects"