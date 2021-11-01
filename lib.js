const definition = (
  daysCount,
  tarif,
  discountPlan,
  range = 4,
  discount = 0,
  i = 0
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
        ++i
      )
    );
  }
};

const defineDateRange = (startDate, finishDate) => {
  const sDate = new Date(startDate);
  const fDate = new Date(finishDate);

  const startDay = sDate.getDay();
  const finishDay = fDate.getDay();

  const diff = fDate - sDate;
  const dateRange = Math.ceil(diff / (1000 * 3600 * 24)) + 1;

  if (startDay === 6 || startDay === 0) {
    return {
      dateRange,
      startWorkday: false,
    };
  }
  if (finishDay === 6 || finishDay === 0) {
    return {
      dateRange,
      finishWorkday: false,
    };
  }

  return {
    dateRange,
    startWorkday: true,
    finishWorkday: true,
  };
};

const addDays = (date, days) => {
  const ts = new Date(date);
  const result = ts.setDate(ts.getDate() + days);
  return new Date(result);
};

const getStartAndFinishDay = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const firstDay = new Date(year, month, 2).getDate();
  const lastDay = new Date(year, month, 0).getDate();
  return {
    firstDay: new Date(`${year}-${month}-${firstDay}`)
      .toISOString()
      .split('T')[0],
    lastDay: new Date(`${year}-${month}-${lastDay}`)
      .toISOString()
      .split('T')[0],
  };
};

export { definition, defineDateRange, addDays, getStartAndFinishDay };
