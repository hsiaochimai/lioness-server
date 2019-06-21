require('dotenv').config()

const ADMIN_ROLE = 1
const CLIENT_ROLE = 2
const CONTRACTOR_ROLE = 3
const MANAGER_ROLE = 4

//TODO add statuses

const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const ITEMS_PER_PAGE = 10

const projectsDefaultOptions = {
  statusFilter: null,
  searchQuery: null,
  budgetSort: SORT_ASC,
  dateTypeFilter: null,
  dateSort: null,
  afterDate: null,
  beforeDate: null,
  roleFilter: null,
  pageNumber: 1,
}
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://hsiaochimai@localhost:5432/lioness',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://hsiaochimai@localhost:5432/lioness-test',
  ROLES: {
    ADMIN_ROLE,
    CLIENT_ROLE,
    CONTRACTOR_ROLE,
    MANAGER_ROLE,
  },
  FETCH_INFO: {
    SORT_ASC,
    SORT_DESC,
    ITEMS_PER_PAGE,
  },
  projectsDefaultOptions
}