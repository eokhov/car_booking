import dayjs from 'dayjs';

const definition = (
  daysCount,
  tarif,
  discountPlan,
  range = 4,
  discount = 0,
  i = 0,
) => {
  const r = daysCount >= range ? range : daysCount;
  const dC = daysCount - range;
  const cost = discount !== 0 ? tarif - (tarif / 100) * discount : tarif;

  if (dC <= 0) {
    return cost * r;
  } else {
    return (
      cost * r +
      definition(
        dC,
        tarif,
        discountPlan,
        ++range,
        discountPlan[i].discount_size,
        ++i,
      )
    );
  }
};

const defineDateRange = (startDate, finishDate) => {
  const startDay = dayjs(startDate).day();
  const finishDay = dayjs(finishDate).day();

  if (startDay === 6 || startDay === 0) {
    return {
      startWorkday: false,
    };
  }
  if (finishDay === 6 || finishDay === 0) {
    return {
      finishWorkday: false,
    };
  }

  return {
    startWorkday: true,
    finishWorkday: true,
  };
};

const addDays = (date, days) =>
  dayjs(date).add(days, 'day').format('YYYY-MM-DD');

const getDatesRange = (start, finish) => dayjs(finish).diff(start, 'days');

const getStartAndFinishDay = m => {
  const month = dayjs().set('month', --m);

  return {
    firstDay: month.set('date', 1).format('YYYY-MM-DD'),
    lastDay: month.set('date', month.daysInMonth()).format('YYYY-MM-DD'),
  };
};

class D {
  constructor(first, last) {
    this.firstDate = first;
    this.lastDate = last;
    this.range = this.calcRange();
  }

  calcRange() {
    return dayjs(this.lastDate).diff(this.firstDate, 'days') + 1;
  }
}

const defineTransitionMonth = (from, to) => {
  const fromM = dayjs(from).month();
  const toM = dayjs(to).month();

  if (fromM !== toM) {
    const lastDateFrom = dayjs(from).daysInMonth();
    return [
      new D(
        dayjs(from).format('YYYY-MM-DD'),
        dayjs(from).set('date', lastDateFrom).format('YYYY-MM-DD'),
      ),
      new D(
        dayjs(to).date(1).format('YYYY-MM-DD'),
        dayjs(to).format('YYYY-MM-DD'),
      ),
    ];
  } else {
    return [
      new D(dayjs(from).format('YYYY-MM-DD'), dayjs(to).format('YYYY-MM-DD')),
    ];
  }
};

export {
  definition,
  defineDateRange,
  addDays,
  getDatesRange,
  getStartAndFinishDay,
  defineTransitionMonth,
};
