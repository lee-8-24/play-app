<template>
  <dv-full-screen-container class="root">
    <dv-loading v-if="loading">Loading...</dv-loading>
    <div class="layout">
      <dv-border-box1 class="player-container">
        <div class="player">
          <p>当前园内人数:</p>
          <dv-digital-flop
            :config="playerInConfig"
            style="width: 60%; height: 80px"
          />
          <dv-decoration-6 style="width: 300px; height: 30px" />
          <p>今日游园人次:</p>
          <dv-digital-flop
            :config="playerAllConfig"
            style="width: 60%; height: 80px"
          />
        </div>
      </dv-border-box1>
      <dv-border-box-1>
        <div class="title">
          <div>
            <dv-decoration-9 style="width: 150px; height: 150px"
              >运行正常</dv-decoration-9
            >
          </div>
          <div>
            <p>欢乐谷大数据平台</p>
            <p class="time">{{ dateString }}</p>
          </div>
        </div>
      </dv-border-box-1>
      <dv-border-box1 class="top-container">
        <div class="top">
          <p>游乐项目今日人次排行</p>
          <dv-scroll-ranking-board
            :config="topConfig"
            style="width: 80%; height: 80%"
          />
        </div>
      </dv-border-box1>
      <dv-border-box1 class="current-container">
        <QueueView></QueueView>
      </dv-border-box1>
      <dv-border-box1 class="customer-container">
        <CustomerView></CustomerView>
      </dv-border-box1>
      <dv-border-box1 class="suggestion-container">
        <div class="suggestion">
          <dv-active-ring-chart
            :config="suggestionConfig"
            style="width: 300px; height: 300px"
          />
          <div class="right">
            <div class="percent">
              <p>今日设备检修完成度</p>
              <dv-percent-pond
                :config="{ value: 66, lineDash: [10, 2] }"
                style="width: 200px; height: 100px"
              />
            </div>
            <dv-decoration-3 style="width: 200px; height: 60px" />
          </div></div
      ></dv-border-box1>
      <dv-border-box1 class="suggestion-detail-container">
        <div class="suggestion-detail">
          <dv-scroll-board
            :config="suggestionDetailConfig"
            style="width: 90%; height: 100%"
          />
        </div>
      </dv-border-box1>
    </div>
  </dv-full-screen-container>
</template>

<script>
import * as dayjs from "dayjs";
import label from "@/data/labels.json";
import QueueView from "@/components/QueueView";
import CustomerView from "@/components/CustomerView";
import { getCurrentPlayerCount } from "@/util/data";

export default {
  name: "Screen",
  components: {
    CustomerView,
    QueueView,
  },
  mounted() {
    this.cancelLoading();

    setInterval(() => {
      this.dateString = dayjs().format("YYYY/MM/DD HH:mm:ss");
    }, 1000);

    setInterval(() => {
      const playerCount = getCurrentPlayerCount();

      this.playerInConfig = {
        ...this.playerInConfig,
        number: [playerCount["in"]],
      };

      this.playerAllConfig = {
        ...this.playerAllConfig,
        number: [playerCount["tot"]],
      };
    }, 1000);
  },
  data() {
    return {
      loading: true,
      dateString: "",
      playerInConfig: {
        number: [30 * Math.random()],
        content: "{nt}人",
        style: {
          fontSize: 48,
        },
      },
      playerAllConfig: {
        number: [30 * Math.random()],
        content: "{nt}人次",
        style: {
          fontSize: 48,
        },
      },
      topConfig: {
        data: label.map((v) => {
          return {
            name: v.label,
            value: parseInt((Math.random() * 100).toFixed(0)),
          };
        }),
      },
      suggestionConfig: {
        data: [
          {
            name: "新增投诉",
            value: 16,
          },
          {
            name: "待解决投诉",
            value: 24,
          },
          {
            name: "已解决投诉",
            value: 116,
          },
        ],
        lineWidth: 18,
        color: ["#ee3e3e", "#e67334", "#414242"],
        digitalFlopStyle: {
          fontSize: 14,
        },
        showOriginValue: true,
      },
      suggestionDetailConfig: {
        data: [
          ["CC", "整体感觉很不错，就是最想玩的矿山车人还是好多"],
          [
            "Willams",
            "感觉有了这个功能之后确实方便了许多，真不错。",
          ],
          ["哈哈哈哈", "霸王龙大草帽没想想中的那么好玩，有点儿失望。"],
          ["大树树 ", "感觉最好玩儿的项目就是高空飞翔了，下次还要再尝试。"],
          [
            "霸波奔",
            "这次来欢乐谷感觉确实没有原来那么拥挤了，但是惊魂实验室还是等了很久。",
          ],
          ["辣个蓝人", "重度纠结症患者，感觉最优下一站这个功能确实帮了我很多。"],
          ["木十八", "我是个路痴，线路规划找着路标确实能省不少力。"],
          [
            "天蓬元帅",
            "可以拖动改变位置，我感觉这一点还挺使用的。",
          ],
        ],
        oddRowBGC: "rgba(0,0,0,0)",
        evenRowBGC: "rgba(0,0,0,0)",
        align: ["left", "left", "center"],
        columnWidth: [80, 120],
        index: true,
      },
    };
  },
  methods: {
    cancelLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  background: url("/assets/background.png");

  .layout {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 25vh repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 18px;

    .title {
      color: white;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 100%;

      div:first-child {
        font-size: 14px;
        color: limegreen;
        font-weight: bold;
      }

      div:last-child {
        p:first-child {
          font-size: 28px;
          margin-bottom: 8px;
        }

        p:last-child {
          font-size: 16px;
        }
      }
    }

    .player-container {
      grid-row-start: 1;
      grid-row-end: 3;
      grid-column-start: 1;
      grid-column-end: 2;

      .player {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;

        p {
          color: white;
          font-size: 26px;
          font-weight: bold;
          padding-left: 20px;
        }
      }
    }

    .top-container {
      grid-row-start: 1;
      grid-row-end: 3;
      grid-column-start: 3;
      grid-column-end: 4;

      .top {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        p {
          padding-bottom: 8px;
          color: white;
          font-size: 32px;
          margin: 0;
        }
      }
    }

    .current-container {
      grid-row-start: 3;
      grid-row-end: 5;
      grid-column-start: 3;
      grid-column-end: 4;

      .current {
        height: 100%;
      }
    }

    .customer-container {
      grid-row-start: 3;
      grid-row-end: 5;
      grid-column-start: 1;
      grid-column-end: 2;
    }

    .suggestion-container {
      grid-row-start: 4;
      grid-row-end: 5;
      grid-column-start: 2;
      grid-column-end: 3;

      .suggestion {
        height: 100%;

        display: flex;
        box-sizing: border-box;

        .right {
          margin-top: 22px;
          margin-right: 16px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;

          .percent {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            p {
              color: white;
              font-size: 22px;
            }
          }
        }
      }
    }

    .suggestion-detail-container {
      grid-row-start: 2;
      grid-row-end: 4;
      grid-column-start: 2;
      grid-column-end: 3;

      .suggestion-detail {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        padding: 16px;
      }
    }
  }
}
</style>
