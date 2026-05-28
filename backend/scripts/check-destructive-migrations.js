const fs = require('node:fs')
const path = require('node:path')

const migrationsDir = path.resolve(__dirname, '../prisma/migrations')

const destructivePatterns = [
  {
    label: 'DROP TABLE/SCHEMA/DATABASE',
    pattern: /\bDROP\s+(TABLE|SCHEMA|DATABASE)\b/i,
  },
  {
    label: 'DROP COLUMN',
    pattern: /\bALTER\s+TABLE\b[\s\S]*?\bDROP\s+COLUMN\b/i,
  },
  {
    label: 'TRUNCATE',
    pattern: /\bTRUNCATE\b/i,
  },
  {
    label: 'DELETE FROM',
    pattern: /\bDELETE\s+FROM\b/i,
  },
]

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
}

function listMigrationFiles(dir) {
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return listMigrationFiles(entryPath)
      return entry.name === 'migration.sql' ? [entryPath] : []
    })
}

function main() {
  const findings = []

  for (const filePath of listMigrationFiles(migrationsDir)) {
    const sql = stripSqlComments(fs.readFileSync(filePath, 'utf8'))
    for (const rule of destructivePatterns) {
      if (rule.pattern.test(sql)) {
        findings.push({
          filePath: path.relative(process.cwd(), filePath),
          label: rule.label,
        })
      }
    }
  }

  if (findings.length === 0) {
    console.log('Nenhuma migration destrutiva encontrada.')
    return
  }

  console.error('Possiveis migrations destrutivas encontradas:')
  for (const finding of findings) {
    console.error(`- ${finding.filePath}: ${finding.label}`)
  }

  if (process.env.ALLOW_DESTRUCTIVE_MIGRATIONS === 'true') {
    console.error('ALLOW_DESTRUCTIVE_MIGRATIONS=true definido; seguindo com override explicito.')
    return
  }

  console.error(
    [
      '',
      'Bloqueado por seguranca para proteger dados de producao.',
      'Revise a migration, gere backup antes do deploy e, se a mudanca for intencional, rode novamente com ALLOW_DESTRUCTIVE_MIGRATIONS=true.',
    ].join('\n'),
  )
  process.exit(1)
}

main()
