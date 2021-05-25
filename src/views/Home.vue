<template>
  <div>
    <div class="home-header">
      <p>智慧游乐场排队系统服务中心</p>
      <sui-button-group>
        <sui-button content="大数据中心" @click="$router.push('screen')" />
        <sui-button content="游园地图" @click="$router.push('map')" />
        <sui-button content="客户服务" @click.native="toggle" />
      </sui-button-group>
    </div>
    <div class="home" id="home">
      <div class="preface-section home-item" id="preface-section">
        <div class="preface">
          <sui-card>
            <sui-image src="assets/guide.png" />
          </sui-card>
        </div>
        <div class="preface-intro">
          <h2>游乐场排队系统</h2>
          <div class="divider"></div>
          <p>
            我们是一家专注于游乐场排队系统设计的公司。为客户提供数据分析,系统设计,等多维度,全方面的服务。致力于帮助管理人员合理规划、提升游客游玩体验
          </p>
        </div>
      </div>
      <div class="sub-section home-item" id="sub-section">
        <div class="sub-section-title">
          <h2>我们的服务</h2>
        </div>
        <div class="sub-section-row">
          <sui-card>
            <sui-image src="assets/bigdata.jpg" />
            <sui-card-content>
              <sui-card-header>游园大数据中心</sui-card-header>
              <sui-card-meta>Big Data Center</sui-card-meta>
            </sui-card-content>
            <sui-button attached="bottom" @click="$router.push('screen')">
              <sui-icon name="add" />
              了解更多
            </sui-button>
          </sui-card>
          <sui-card>
            <sui-image src="assets/guide.png" />
            <sui-card-content>
              <sui-card-header>游园地图</sui-card-header>
              <sui-card-meta>Guide Map</sui-card-meta>
            </sui-card-content>
            <sui-button attached="bottom" @click="$router.push('map')">
              <sui-icon name="add" />
              了解更多
            </sui-button>
          </sui-card>
          <sui-card>
            <sui-image src="assets/重庆之眼.jpg" />
            <sui-card-content>
              <sui-card-header>客户服务</sui-card-header>
              <sui-card-meta>Customer Service</sui-card-meta>
            </sui-card-content>
            <sui-button attached="bottom" @click.native="toggle">
              <sui-icon name="add" />
              了解更多
            </sui-button>
            <sui-modal v-model="infoOpen">
              <sui-modal-header>暂未开放</sui-modal-header>
              <sui-modal-content>
                <sui-modal-description>
                  <sui-header>该项服务尚未开放</sui-header>
                  <p>非常抱歉,您当前还无法使用该项服务</p>
                </sui-modal-description>
              </sui-modal-content>
              <sui-modal-actions>
                <sui-button positive @click.native="toggle"> OK</sui-button>
              </sui-modal-actions>
            </sui-modal>
          </sui-card>
        </div>
      </div>
      <div class="intro-section home-item" id="intro-section">
        <slider animation="fade">
          <slider-item
            v-for="(i, index) in list"
            :key="index"
            :style="`background: url(${i.url})`"
            class="slider-item"
          >
            <div class="intro">
              <p>{{ i.title }}</p>
              <p>{{ i.intro }}</p>
            </div>
          </slider-item>
        </slider>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from "@/util/util";

export default {
  mounted() {
    window.addEventListener("wheel", debounce(this.scrollSection, 300));
  },
  data() {
    return {
      infoOpen: false,
      pageIndex: 0,
      list: [
        {
          url: "assets/intro1.jpg",
          title: "面向游乐场",
          intro: "提高工作效率，提高利益",
        },
        {
          url: "assets/intro2.jpg",
          title: "面向游客",
          intro: "改善体验，更加便捷",
        },
        {
          url: "assets/intro3.jpg",
          title: "待拓展",
          intro: "数据服务与景区服务",
        },
      ],
    };
  },
  methods: {
    toggle() {
      this.infoOpen = !this.infoOpen;
    },
    scrollSection(e) {
      const isDown = e.wheelDeltaY < 0;
      const scrollOption = {
        container: "#home",
        duration: 500,
        easing: "ease",
        offset: 0,
        force: true,
        cancelable: false,
        onStart: false,
        onDone: false,
        onCancel: false,
        x: false,
        y: true,
      };

      if (this.pageIndex === 0) {
        if (isDown) {
          this.$scrollTo("#sub-section", scrollOption);
          this.pageIndex = 1;
        }

        return;
      }

      if (this.pageIndex === 1) {
        if (isDown) {
          this.$scrollTo("#intro-section", scrollOption);
          this.pageIndex = 2;
        } else {
          this.$scrollTo("#preface-section", scrollOption);
          this.pageIndex = 0;
        }

        return;
      }

      if (this.pageIndex === 2) {
        if (!isDown) {
          this.$scrollTo("#sub-section", scrollOption);
          this.pageIndex = 1;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.home-header {
  height: 8vh;
  background: #409eff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    padding-left: 16px;
    font-weight: bold;
    font-size: 18px;
    margin: 0;
    color: white;
    text-align: center;
  }

  .ui .button {
    background: transparent;
    color: white;
  }
}

.home-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.home {
  width: 100vw;
  height: 92vh;
  overflow-y: hidden;

  .preface-section {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .preface {
      padding: 16px 32px;

      .card {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          object-fit: contain;
        }
      }
    }

    .preface-intro {
      padding: 16px 32px;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      h2 {
        font-size: 26px;
        font-weight: lighter;
      }

      .divider {
        width: 100%;
        border-bottom: rgba(128, 128, 128) solid 1px;
        padding: 2px 4px;
      }

      p {
        text-align: start;
        font-size: 16px;
        letter-spacing: 3px;
        margin-top: 12px;
      }
    }
  }

  .sub-section {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .sub-section-title {
      margin-bottom: 48px;

      h2 {
        font-size: 32px;
        font-weight: lighter;
      }
    }

    .sub-section-row {
      display: flex;
      justify-content: space-evenly;
      width: 100%;

      .card {
        margin: 0;

        img {
          height: 200px;
        }

        .content {
          flex-grow: 0;

          .header {
            font-size: 22px;
            font-weight: lighter;
          }

          .meta {
            font-size: 16px;
            font-weight: lighter;
          }
        }
      }
    }
  }

  .intro-section {
    .slider {
      width: 100% !important;
      height: 60vh !important;

      .slider-item {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;

        display: flex;
        flex-direction: column-reverse;
        align-items: flex-start;
        justify-content: center;

        .intro {
          padding-top: 12%;
          padding-left: 72px;
          color: white;
          text-align: left;

          p {
            margin: 0;
          }

          p:first-child {
            font-size: 32px;
          }

          p:last-child {
            font-size: 26px;
            font-weight: lighter;
          }
        }
      }
    }
  }
}
</style>
