// @ts-nocheck
// TimeWraith regression test: Raven Archivist's reproduction, rerun by code before it was accepted.
// Failed on harrisiirak/cron-parser@5c378949a738 at 2024-04-06T14:00:00.000Z, 2024-04-06T14:00:00.000Z. Run with TZ=Australia/Lord_Howe.

function print() {}
function check(cond, msg) {
  const rule = String(msg || 'check');
  expect({ rule, holds: Boolean(cond) }).toEqual({ rule, holds: true });
}
async function load(p) { return require("../../" + String(p).replace(/^\/+/, '')); }

test("addHour does not advance at Lord Howe DST end; hourly cron throws", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(1712412000000));
  const now = new Date(1712412000000);  // the same `now` the probe had
  try {
const C=(await load('src/CronDate')).CronDate;
const t=new Date(Date.now());
const d=new C(t,'Australia/Lord_Howe');d.addHour();
check(d.toDate().getTime()>t.getTime(),'addHour must advance');
  } finally {
    jest.useRealTimers();
  }
}, 60000);

test("addHour does not advance at Lord Howe DST end; hourly cron throws (through the public API)", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(1712412000000));
  const now = new Date(1712412000000);  // the same `now` the probe had
  try {
const P=(await load('src/CronExpressionParser')).CronExpressionParser;
const now=new Date(Date.now());
let n;
try{n=P.parse('0 * * * *',{currentDate:now,tz:'Australia/Lord_Howe'}).next().getTime();}catch(e){n=null;}
check(n!==null && n>now.getTime(),'next() returns a time after now');
  } finally {
    jest.useRealTimers();
  }
}, 60000);
