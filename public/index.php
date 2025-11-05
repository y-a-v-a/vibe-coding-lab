<?php
/**
 * Dynamic Project Index Generator
 * Automatically scans directories and generates project list
 * Inspired by generate-index.sh
 */

// Get all directories in current location
$projects = [];
$current_dir = __DIR__;

// Scan directory for projects
if ($handle = opendir($current_dir)) {
    while (false !== ($entry = readdir($handle))) {
        $project_path = $current_dir . '/' . $entry;

        // Check if it's a directory and not . or .. and has an index.html
        if ($entry !== '.' && $entry !== '..' && is_dir($project_path)) {
            $index_file = $project_path . '/index.html';

            if (file_exists($index_file)) {
                $project = [];
                $project['name'] = $entry;

                // Extract title from HTML file
                $html_content = file_get_contents($index_file);
                if (preg_match('/<title>(.*?)<\/title>/i', $html_content, $matches)) {
                    $project['title'] = trim($matches[1]);
                } else {
                    $project['title'] = $entry;
                }

                // Check for README.md and extract copyright
                $readme_file = $project_path . '/README.md';
                $project['copyright'] = '';

                if (file_exists($readme_file)) {
                    $readme_lines = file($readme_file);
                    foreach ($readme_lines as $line) {
                        if (preg_match('/^\(c\)/i', $line)) {
                            $project['copyright'] = trim($line);
                            break;
                        }
                    }
                }

                $projects[] = $project;
            }
        }
    }
    closedir($handle);
}

// Sort projects alphabetically by name
usort($projects, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibe Coding Lab • Projects</title>
  <link rel="icon" href="data:,">
  <style>
    body {
      color: #202020;
      font-size: 1.25em;
      line-height: 1.3;
      max-width: 100%;
      margin: 1.2em;
    }

    @media (min-width: 1024px) {
      body {
        max-width: 36em;
      }
    }

    a,
    a:hover,
    a:visited {
      color: #303030;
    }

    a:hover {
      text-decoration: none;
    }

    .description {
        margin-left: 2em;
        margin-bottom: 2em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Vibe Coding Lab</h1>
    <div class="projects-grid">
    <h2>list of works</h2>
<?php foreach ($projects as $project): ?>
      <div class="project-card">
        <a href="<?php echo htmlspecialchars($project['name']); ?>/" target="_blank">
            <h3><?php echo htmlspecialchars($project['title']); ?></h3>
        </a>
        <div class="description">
            <p>Project: <?php echo htmlspecialchars($project['name']); ?></p>
            <?php if (!empty($project['copyright'])): ?>
            <p><?php echo htmlspecialchars($project['copyright']); ?></p>
            <?php endif; ?>
        </div>
      </div>
<?php endforeach; ?>
    </div>
    <div class="footer">
      <p><a href="https://vibes.vincentbruijn.nl">vibes</a> © <?php echo date('Y'); ?> by <a href="https://www.vincentbruijn.nl">Vincent Bruijn</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"></p>
    </div>
  </div>
</body>
</html>
