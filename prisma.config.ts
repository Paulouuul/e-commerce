import { defineConfig } from 'prisma/config'
import 'dotenv/config'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada no arquivo .env')
}
export default defineConfig({
  datasource: {
      url: DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})