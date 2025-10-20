import all_product from '../../../data/all_product'

const initialOrders = [
  {
    id: 101,
    customer: "Nguyễn Văn A",
    date: "2025-10-01",
    products: [all_product[0], all_product[1]],
    total: all_product[0].new_price + all_product[1].new_price,
    status: "Pending",
  },
  {
    id: 102,
    customer: "Nguyễn Văn B",
    date: "2025-10-02",
    products: [all_product[2], all_product[4]],
    total: all_product[2].new_price + all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 103,
    customer: "Nguyễn Văn C",
    date: "2025-10-03",
    products: [all_product[1], all_product[3]],
    total: all_product[1].new_price + all_product[3].new_price,
    status: "Cancelled",
  },
  {
    id: 104,
    customer: "Nguyễn Văn D",
    date: "2025-10-04",
    products: [all_product[0], all_product[2], all_product[4]],
    total:
      all_product[0].new_price +
      all_product[2].new_price +
      all_product[4].new_price,
    status: "Pending",
  },
  {
    id: 105,
    customer: "Nguyễn Văn E",
    date: "2025-10-05",
    products: [all_product[3], all_product[4]],
    total: all_product[3].new_price + all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 106,
    customer: "Nguyễn Văn F",
    date: "2025-10-06",
    products: [all_product[2], all_product[0]],
    total: all_product[2].new_price + all_product[0].new_price,
    status: "Pending",
  },
  {
    id: 107,
    customer: "Nguyễn Văn G",
    date: "2025-10-07",
    products: [all_product[1], all_product[2], all_product[3]],
    total:
      all_product[1].new_price +
      all_product[2].new_price +
      all_product[3].new_price,
    status: "Confirmed",
  },
  {
    id: 108,
    customer: "Nguyễn Văn H",
    date: "2025-10-08",
    products: [all_product[4]],
    total: all_product[4].new_price,
    status: "Cancelled",
  },
  {
    id: 109,
    customer: "Nguyễn Văn I",
    date: "2025-10-09",
    products: [all_product[0], all_product[1], all_product[3]],
    total:
      all_product[0].new_price +
      all_product[1].new_price +
      all_product[3].new_price,
    status: "Pending",
  },
  {
    id: 110,
    customer: "Nguyễn Văn J",
    date: "2025-10-10",
    products: [all_product[2], all_product[4]],
    total: all_product[2].new_price + all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 111,
    customer: "Nguyễn Văn K",
    date: "2025-10-11",
    products: [all_product[1], all_product[3]],
    total: all_product[1].new_price + all_product[3].new_price,
    status: "Pending",
  },
  {
    id: 112,
    customer: "Nguyễn Văn L",
    date: "2025-10-12",
    products: [all_product[0], all_product[4]],
    total: all_product[0].new_price + all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 113,
    customer: "Nguyễn Văn M",
    date: "2025-10-13",
    products: [all_product[2], all_product[3]],
    total: all_product[2].new_price + all_product[3].new_price,
    status: "Cancelled",
  },
  {
    id: 114,
    customer: "Nguyễn Văn N",
    date: "2025-10-14",
    products: [all_product[1], all_product[4]],
    total: all_product[1].new_price + all_product[4].new_price,
    status: "Pending",
  },
  {
    id: 115,
    customer: "Nguyễn Văn O",
    date: "2025-10-15",
    products: [all_product[0], all_product[3], all_product[4]],
    total:
      all_product[0].new_price +
      all_product[3].new_price +
      all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 116,
    customer: "Nguyễn Văn P",
    date: "2025-10-16",
    products: [all_product[2]],
    total: all_product[2].new_price,
    status: "Cancelled",
  },
  {
    id: 117,
    customer: "Nguyễn Văn Q",
    date: "2025-10-17",
    products: [all_product[1], all_product[2]],
    total: all_product[1].new_price + all_product[2].new_price,
    status: "Pending",
  },
  {
    id: 118,
    customer: "Nguyễn Văn R",
    date: "2025-10-18",
    products: [all_product[3]],
    total: all_product[3].new_price,
    status: "Confirmed",
  },
  {
    id: 119,
    customer: "Nguyễn Văn S",
    date: "2025-10-19",
    products: [all_product[0], all_product[1], all_product[2]],
    total:
      all_product[0].new_price +
      all_product[1].new_price +
      all_product[2].new_price,
    status: "Pending",
  },
  {
    id: 120,
    customer: "Nguyễn Văn T",
    date: "2025-10-20",
    products: [all_product[4], all_product[2]],
    total: all_product[4].new_price + all_product[2].new_price,
    status: "Confirmed",
  },
  {
    id: 121,
    customer: "Nguyễn Văn U",
    date: "2025-10-21",
    products: [all_product[3], all_product[4]],
    total: all_product[3].new_price + all_product[4].new_price,
    status: "Cancelled",
  },
  {
    id: 122,
    customer: "Nguyễn Văn V",
    date: "2025-10-22",
    products: [all_product[0], all_product[1]],
    total: all_product[0].new_price + all_product[1].new_price,
    status: "Pending",
  },
  {
    id: 123,
    customer: "Nguyễn Văn W",
    date: "2025-10-23",
    products: [all_product[2], all_product[3]],
    total: all_product[2].new_price + all_product[3].new_price,
    status: "Confirmed",
  },
  {
    id: 124,
    customer: "Nguyễn Văn X",
    date: "2025-10-24",
    products: [all_product[4]],
    total: all_product[4].new_price,
    status: "Pending",
  },
  {
    id: 125,
    customer: "Nguyễn Văn Y",
    date: "2025-10-25",
    products: [all_product[1], all_product[2], all_product[4]],
    total:
      all_product[1].new_price +
      all_product[2].new_price +
      all_product[4].new_price,
    status: "Confirmed",
  },
  {
    id: 126,
    customer: "Nguyễn Văn Z",
    date: "2025-10-26",
    products: [all_product[0], all_product[3]],
    total: all_product[0].new_price + all_product[3].new_price,
    status: "Pending",
  },
];

export default initialOrders;
