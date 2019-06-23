require('dotenv').config()

const ADMIN_ROLE = 1
const CLIENT_ROLE = 2
const CONTRACTOR_ROLE = 3
const MANAGER_ROLE = 4

const STATUS_ESTIMATE = 1
const STATUS_IN_PROGRESS = 2
const STATUS_BILLED = 3
const STATUS_OTHER = 4

//TODO add statuses

const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const ITEMS_PER_PAGE = 10

const projectsDefaultOptions = {
  statusFilter: null,
  budgetSort: SORT_DESC,
  dateTypeFilter: null,
  dateSort: null,
  afterDate: null,
  beforeDate: null,
  roleFilter: null,
  pageNumber: 1,
}
const usersDefaultOptions = {
  idsFilter: null, // pass a non-empty array to fetch users by theirs ids
  searchQuery: null,
  userNameSort: SORT_ASC,
  activeProjSort: null,
  inactive: false,
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
  PROJECT_STATUESES: {
    STATUS_ESTIMATE,
    STATUS_IN_PROGRESS,
    STATUS_BILLED,
    STATUS_OTHER
  },

  FETCH_INFO: {
    SORT_ASC,
    SORT_DESC,
    ITEMS_PER_PAGE,
  },
  projectsDefaultOptions,
  usersDefaultOptions
}