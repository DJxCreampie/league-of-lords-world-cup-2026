import upcoming from '../src/data/mock-api/upcoming-match.json' assert { type: 'json' }
import live from '../src/data/mock-api/live-match.json' assert { type: 'json' }
import completed from '../src/data/mock-api/completed-match.json' assert { type: 'json' }
import standings from '../src/data/mock-api/team-standings.json' assert { type: 'json' }

const statuses = [upcoming.fixture.status, live.fixture.status, completed.fixture.status]
console.log('Mock fixtures loaded:', statuses.join(', '))
console.log('Standings rows:', standings.table.length)
