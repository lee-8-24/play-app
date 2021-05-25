<template>
  <div class="customer-container">
    <p>游园人数统计</p>
    <div class="graph" ref="customer-view-container"></div>
  </div>
</template>

<script>
import Charts from "@jiaminghi/charts";
import { getPlayerCount, getModifiedTime } from "@/util/data";

export default {
  name: "CustomerView",
  mounted() {
    const element = this.$refs["customer-view-container"];

    const chart = new Charts(element);

    chart.setOption(this.option);
  },
  data() {
    return {
      option: {
        xAxis: {
          name: "时间",
          data: [
            "8:00",
            "9:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
          ],
          axisLabel: {
            style: {
              fill: "#fff",
              fontSize: 14,
              rotate: -35,
            },
          },
          nameTextStyle: {
            fill: "#fff",
            fontSize: 14,
          },
        },
        yAxis: {
          name: "游客数量",
          data: "value",
          axisLabel: {
            style: {
              fill: "#fff",
              fontSize: 14,
            },
          },
          nameTextStyle: {
            fill: "#fff",
            fontSize: 14,
          },
        },
        series: [
          {
            data: this.getSeriesData(),
            type: "line",
            lineArea: {
              show: true,
              gradient: ["rgba(55, 162, 218, 0.6)", "rgba(55, 162, 218, 0)"],
            },
            label: {
              style: {
                fontSize: 26,
                fill: "#fff",
              },
            },
          },
        ],
      },
    };
  },
  methods: {
    getSeriesData() {
      const time = [];
      const date = getModifiedTime();

      for (let i = 0; i < date.getHours() - 8; i++) time.push(i);

      return time.map((v) => getPlayerCount(v * 60)["tot"]);
    },
  },
};
</script>

<style scoped lang="scss">
.customer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;

  p {
    padding-top: 16px;
    font-size: 26px;
    color: white;
    margin: 0;
  }

  .graph {
    flex-grow: 2;
  }
}
</style>
