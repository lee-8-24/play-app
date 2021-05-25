<template>
  <div class="queue-container">
    <p>游乐项目当前排队人数</p>
    <div class="graph" ref="current-queue-container"></div>
  </div>
</template>

<script>
import Charts from "@jiaminghi/charts";
import label from "@/data/labels.json";
import { getCurrentWaitNum } from "@/util/data";

export default {
  name: "queue_view",
  data() {
    return {
      option: {
        series: [
          {
            type: "pie",
            data: label
              .map((v) => {
                return {
                  name: v.label,
                  value: getCurrentWaitNum(v.label),
                };
              })
              .sort((a, b) => -a.value + b.value)
              .slice(0, 6),
            insideLabel: {
              show: true,
              formatter: "{value}人",
              style: {
                fontSize: 9,
              },
            },
            outsideLabel: {
              style: {
                fontSize: 16,
              },
            },
            roseType: true,
          },
        ],
      },
    };
  },
  mounted() {
    const element = this.$refs["current-queue-container"];

    const chart = new Charts(element);

    chart.setOption(this.option);
  },
};
</script>

<style lang="scss" scoped>
.queue-container {
  display: flex;
  flex-direction: column;
  height: 100%;

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
