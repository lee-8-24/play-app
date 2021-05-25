<template>
  <div class="root-container">
    <div class="control-layer">
      <div class="top-right-control-bar" v-if="currentPath !== null">
        <sui-card>
          <sui-card-header>路线规划</sui-card-header>
          <sui-card-content>
            <sui-step-group vertical fluid>
              <sui-step
                v-for="path in currentPath"
                :key="path"
                active
                :icon="getPathIcon(path)"
                :description="
                  getPathDescription(
                    path,
                    Math.round(currentDistanceMap.get(path))
                  )
                "
                :title="path"
              ></sui-step>
            </sui-step-group>
          </sui-card-content>
        </sui-card>
      </div>
      <div class="top-left-control-bar">
        <sui-search :source="source" @select="handleSearch">
          <template v-slot:input="{ props, handlers }">
            <sui-input
              v-bind="props"
              v-on="handlers"
              placeholder="搜索您要前往的地点"
              icon-position="left"
              icon="search"
              class="search-input"
            />
          </template>
        </sui-search>

        <sui-card v-if="currentPosition !== null" class="current-position"
          ><sui-card-content
            >当前位置: {{ markers[currentPosition]["label"] }}</sui-card-content
          ></sui-card
        >
        <sui-card v-if="currentBest !== null" class="current-best">
          <sui-card-content>
            当前最优目的地: {{ currentBest.label }}
            <sui-card-content extra>
              <p>
                <sui-icon name="paper plane" />预计步行时间:
                {{ currentBest.distance }} 分钟
              </p>
              <p>
                <sui-icon name="clock" />预计等待时间:
                {{ currentBest.time }} 分钟
              </p>
            </sui-card-content>
          </sui-card-content>
        </sui-card>
        <sui-card class="detail" v-if="currentLabel !== null">
          <sui-image :src="currentLabel.img" />
          <sui-card-content>
            <sui-card-header>{{ currentLabel.label }}</sui-card-header>
            <sui-card-meta class="vote">
              观景指数:
              <sui-rating
                :rating="currentLabel.scenery"
                :max-rating="5"
                disabled
              />
              欢乐指数:
              <sui-rating :rating="currentLabel.fun" :max-rating="5" disabled />
            </sui-card-meta>
            <sui-card-description>{{
              currentLabel.description
            }}</sui-card-description>
          </sui-card-content>
          <sui-card-content extra>
            <div class="wait-info">
              <div>
                <sui-icon name="user" />
                <span>当前排队人数: {{ waitNum(currentLabel.label) }}人</span>
              </div>
              <div>
                <sui-icon name="clock" />
                预计等待时间: {{ waitTime(currentLabel.label) }}分钟
              </div>
            </div>
          </sui-card-content>
        </sui-card>
      </div>
      <!--      <div class="bottom-right-control-bar">-->
      <!--        <sui-button icon="zoom in" @click="zoomIn" />-->
      <!--        <sui-button icon="zoom out" @click="zoomOut" />-->
      <!--        <sui-button icon="sync alternate" @click="resetScale"></sui-button>-->
      <!--      </div>-->
    </div>
    <v-stage
      :config="stageConfig"
      ref="stage"
      @wheel="onWheelScroll"
      @click="onStageClick"
      class="stage-container"
    >
      <v-layer>
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: global.width,
            height: global.height,
            fill: '#BAD588',
          }"
        ></v-rect>
      </v-layer>
      <v-layer>
        <v-image :config="mapConfig" ref="mapObj" @dragend="handleMapDrag">
        </v-image>
      </v-layer>
      <v-layer>
        <v-image
          v-for="item in markers"
          :config="item"
          :key="`marker-${item.label}`"
        ></v-image>
        <v-text
          v-for="item in markers"
          :config="{
            x: item.x,
            y: item.y,
            text: `${item.label}`,
            fontSize: 13,
            fontFamily: 'Ubuntu Mono',
            fill: 'rgba(0,0,0,0)',
          }"
          :key="`text-${item.label}`"
        >
        </v-text>
      </v-layer>
      <v-layer>
        <v-line
          v-for="item in paths"
          :config="item"
          :key="`path-${item.label}`"
        ></v-line>
        <v-text
          v-for="item in paths"
          :config="{
            x: item.mx,
            y: item.my,
            text: `${item.distance}`,
            fontSize: 13,
            fontFamily: 'Ubuntu Mono',
          }"
          :key="`path-distance-${item.label}`"
        >
        </v-text>
      </v-layer>
      <v-layer>
        <v-rect
          v-for="item in labels"
          :key="item.label"
          :config="item"
          @click="handleLabelClick(item)"
        ></v-rect>
      </v-layer>
      <v-layer>
        <!--        <v-rect :config="rectConfig" ref="rect" @dragend="handleDragEnd">-->
        <!--        </v-rect>-->
        <!--        <v-transformer ref="transformer" @transformend="handleTransformEnd" />-->
        <v-image
          :config="positionConfig"
          @dragend="onPositionDragEnd"
          ref="positionObj"
        ></v-image>
      </v-layer>
    </v-stage>
  </div>
</template>
<script>
// import * as Konva from "konva";
import markers from "@/data/marker.json";
import labels from "@/data/labels.json";
import paths from "@/data/path.json";
import { getCurrentWaitNum, getCurrentWaitTime } from "@/util/data";
import PriorityQueue from "priorityqueuejs";

export default {
  name: "Map",
  data() {
    return {
      global: {
        width: 1920,
        height: 960,
      },

      stageConfig: {
        width: 1920,
        height: 960,
      },

      mapConfig: {
        image: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        draggable: true,
      },

      mapImageObj: null,
      markerImageObj: null,

      scale: {
        factor: 1.2,
        minimum: 0.5,
        maximum: 2.5,
      },

      markers: [],
      labels: [],
      paths: [],
      edges: new Map(),
      markerConfig: {
        size: 32,
        offset: 16,
      },

      searchInput: "",
      // rectConfig: {
      //   x: 1920 / 2,
      //   y: 960 / 2,
      //   draggable: true,
      //   width: 20,
      //   height: 20,
      //   fill: "rgba(0,255,0,0.8)",
      // },

      currentBest: null,
      currentLabel: null,
      currentPosition: null,
      currentDistance: null,
      currentDistanceMap: null,
      currentPath: null,
      targetLabel: null,
      positionConfig: {
        image: null,
        width: 36,
        height: 36,
        offsetX: 18,
        offsetY: 18,
        draggable: true,
      },
      source: this.generateSource(),
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.loadAssets();

      setTimeout(() => {
        this.setup();
      }, 500);
    });
  },
  methods: {
    setup() {
      this.loadLabels();
      this.loadMarkers();
      this.loadPaths();

      if (this.currentPosition != null) {
        const obj = this.$refs.positionObj.getNode();
        const marker = this.markers[this.currentPosition];

        obj.x(marker.x);
        obj.y(marker.y);
      }

      this.currentPosition = 0;
      this.findBest();

      this.$refs.stage.getStage().batchDraw();
    },
    calculateDistance(x1, y1, x2, y2) {
      return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    },
    loadPaths() {
      this.edges = {};
      this.paths = [];

      for (const path of paths) {
        const u = path["from"];
        const v = path["to"];

        const um = this.findMarkerByLabel(u);
        const vm = this.findMarkerByLabel(v);

        const distance = this.calculateDistance(um.x, um.y, vm.x, vm.y);

        if (u in this.edges) {
          this.edges[u].push({
            vertex: v,
            distance: distance,
          });
        } else {
          this.edges[u] = [
            {
              vertex: v,
              distance: distance,
            },
          ];
        }

        if (v in this.edges) {
          this.edges[v].push({
            vertex: u,
            distance: distance,
          });
        } else {
          this.edges[v] = [
            {
              vertex: u,
              distance: distance,
            },
          ];
        }

        const line = {
          points: [um.x, um.y, vm.x, vm.y],
          stroke: "red",
          strokeWidth: 10,
          lineCap: "round",
          lineJoin: "round",
          dash: [29, 20, 0.001, 20],
          distance: distance.toFixed(1),
          label: `${path.from}-${path.to}`,
          mx: (um.x + vm.x) / 2,
          my: (um.y + vm.y) / 2,
          from: path["from"],
          to: path["to"],
        };

        if (this.currentPath != null) {
          if (
            this.currentPath.indexOf(path["from"]) !== -1 &&
            this.currentPath.indexOf(path["to"]) !== -1
          ) {
            this.paths.push(line);
          }
        }
      }
    },
    findMarkerByLabel(label) {
      for (const marker of this.markers) {
        if (marker.label === label) {
          return marker;
        }
      }

      return null;
    },
    loadMarkers() {
      this.markers = [];

      for (const marker of markers) {
        this.generateMarker(marker);
      }

      this.positionConfig.x = this.markers[0].x;
      this.positionConfig.y = this.markers[0].y;
    },
    loadLabels() {
      this.$set(this, "labels", []);

      for (const label of labels) {
        const coord = this.denormalizeCoord({
          x: label.x,
          y: label.y,
        });

        this.labels.push(
          Object.assign({}, label, coord, {
            fill: "rgba(255,255,255,0.00)",
            draggable: false,
          })
        );
      }

      this.$refs.stage.getStage().batchDraw();
    },
    loadAssets() {
      const map = this.$refs.mapObj.getNode();

      this.mapImageObj = new Image();

      this.mapImageObj.onload = () => {
        this.mapConfig.image = this.mapImageObj;
        this.mapConfig.x = this.global.width / 2;
        this.mapConfig.y = this.global.height / 2;
        this.mapConfig.width = this.mapImageObj.naturalWidth / 4;
        this.mapConfig.height = this.mapImageObj.naturalHeight / 4;

        map.offsetX(this.mapConfig.width / 2);
        map.offsetY(this.mapConfig.height / 2);
      };

      this.mapImageObj.src = "/assets/map2.webp";

      this.markerImageObj = new Image();
      this.markerImageObj.src = "/assets/marker.png";

      // const rect = this.$refs.rect.getNode();
      //
      // rect.offsetX(this.rectConfig.width / 2);
      // rect.offsetY(this.rectConfig.height / 2);

      // this.$refs.transformer.getNode().nodes([this.$refs.rect.getNode()]);

      const positionImage = new Image();
      positionImage.src = "/assets/pos.png";

      positionImage.onload = () => {
        this.positionConfig.image = positionImage;
      };
    },

    relativePosition() {
      const stage = this.$refs.stage.getStage();

      const transform = stage.getAbsoluteTransform().copy();

      transform.invert();

      const pos = stage.getPointerPosition();

      return transform.point(pos);
    },

    onWheelScroll(e) {
      const stage = this.$refs.stage.getStage();

      const oldScale = stage.scaleX();

      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newScale =
        e.evt.deltaY < 0
          ? oldScale * this.scale.factor
          : oldScale / this.scale.factor;

      if (newScale >= this.scale.maximum || newScale <= this.scale.minimum)
        return;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      stage.position(newPos);
      stage.batchDraw();
    },

    onStageClick(e) {
      e.evt.preventDefault();

      // if (e.evt.button === 0) {
      //   const cursor = this.relativePosition();
      //
      //   this.markers.push({
      //     x: cursor.x - 16,
      //     y: cursor.y - 26,
      //     width: 32,
      //     height: 32,
      //     image: this.markerImageObj,
      //     uid: this.markers.length,
      //   });
      //
      // }
    },
    // resetScale() {
    //   const stage = this.$refs.stage.getStage();
    //   const map = this.$refs.mapObj.getNode();
    //
    //   stage.scale({ x: 1, y: 1 });
    //   map.scale({ x: 1, y: 1 });
    //
    //   stage.position({
    //     x: 0,
    //     y: 0,
    //   });
    //
    //   stage.batchDraw();
    // },
    // zoomIn() {
    //   const map = this.$refs.mapObj.getNode();
    //   const oldScale = map.scaleX();
    //
    //   const newScale = oldScale * this.scale.factor;
    //
    //   if (newScale >= this.scale.maximum || newScale <= this.scale.minimum)
    //     return;
    //
    //   const tween = new Konva.Tween({
    //     node: map,
    //     duration: 0.2,
    //     scaleX: newScale,
    //     scaleY: newScale,
    //     easing: Konva.Easings.Linear,
    //   });
    //
    //   tween.play();
    // },
    // zoomOut() {
    //   const map = this.$refs.mapObj.getNode();
    //   const oldScale = map.scaleX();
    //
    //   const newScale = oldScale / this.scale.factor;
    //
    //   if (newScale >= this.scale.maximum || newScale <= this.scale.minimum)
    //     return;
    //
    //   const tween = new Konva.Tween({
    //     node: map,
    //     duration: 0.2,
    //     scaleX: newScale,
    //     scaleY: newScale,
    //     easing: Konva.Easings.Linear,
    //   });
    //
    //   tween.play();
    // },

    generateMarker(marker) {
      const coord = this.denormalizeCoord({
        x: marker.x,
        y: marker.y,
      });

      this.markers.push({
        x: coord.x,
        y: coord.y,
        width: this.markerConfig.size,
        height: this.markerConfig.size,
        label: marker.label,
        // image: this.markerImageObj,
        offsetX: this.markerConfig.size / 2,
        offsetY: this.markerConfig.size / 2,
        type: marker.type,
      });
    },
    // handleDragEnd(e) {
    //   const coord = this.normalizeCoord({
    //     x: e.target.x(),
    //     y: e.target.y(),
    //   });
    //
    //   console.log(
    //     JSON.stringify({
    //       x: parseInt(coord.x.toFixed(0)),
    //       y: parseInt(coord.y.toFixed(0)),
    //     })
    //   );
    // },
    // handleTransformEnd(e) {
    //   const coord = this.normalizeCoord({
    //     x: e.target.x(),
    //     y: e.target.y(),
    //   });
    //
    //   console.log(
    //     JSON.stringify({
    //       x: parseInt(coord.x.toFixed(0)),
    //       y: parseInt(coord.y.toFixed(0)),
    //       width: parseInt((e.target.width() * e.target.scaleX()).toFixed(0)),
    //       height: parseInt((e.target.height() * e.target.scaleY()).toFixed(0)),
    //     })
    //   );
    // },
    handleMapDrag() {
      const stage = this.$refs.stage.getStage();

      this.setup();

      stage.batchDraw();
    },
    normalizeCoord(coord) {
      const map = this.$refs.mapObj.getNode();

      return {
        x: (coord.x - map.x()) / map.scaleX(),
        y: (coord.y - map.y()) / map.scaleY(),
      };
    },
    denormalizeCoord(coord) {
      const map = this.$refs.mapObj.getNode();

      return {
        x: (coord.x + map.x()) * map.scaleX(),
        y: (coord.y + map.y()) * map.scaleY(),
      };
    },
    handleLabelClick(label) {
      if (this.currentLabel === label) {
        this.currentLabel = null;
      } else {
        this.currentLabel = label;
        this.currentLabel.img = `/assets/${label.label}.jpg`;

        const r = this.findShortestPath();
        this.currentDistance = r.distance;
        this.currentDistanceMap = r.distanceMap;
        this.currentPath = r.path;

        this.loadPaths();
      }
    },
    waitNum(label) {
      return getCurrentWaitNum(label);
    },
    waitTime(label) {
      return getCurrentWaitTime(label);
    },
    onPositionDragEnd() {
      const obj = this.$refs.positionObj.getNode();

      const x = obj.x();
      const y = obj.y();

      let mm = null;
      let md = 0x3f3f3f3f;

      for (let i = 0; i < this.markers.length; i++) {
        const marker = this.markers[i];

        const di = this.calculateDistance(x, y, marker.x, marker.y);

        if (md > di) {
          md = di;
          mm = i;
        }
      }

      const marker = this.markers[mm];

      obj.x(marker.x);
      obj.y(marker.y);

      this.currentPosition = mm;
      this.findBest();
    },
    findBest() {
      const { distanceMap } = this.findShortestPath();

      let med = 0x3f3f3f3f;
      let mei = null;

      for (const [key, value] of distanceMap) {
        if (
          this.findMarkerByLabel(key).type === "游乐设施" &&
          key !== this.markers[this.currentPosition].label
        ) {
          const estimate =
            this.estimateTime(value) * 0.7 + this.waitTime(key) * 0.3;

          if (estimate < med) {
            med = estimate;
            mei = key;
          }
        }
      }

      this.currentBest = {
        label: mei,
        distance: this.estimateTime(distanceMap.get(mei)),
        time: this.waitTime(mei),
      };
    },
    findShortestPath() {
      const source = this.markers[this.currentPosition].label;

      let target;

      if (this.currentLabel === null) {
        target = "重庆之眼";
      } else {
        target = this.currentLabel.label;
      }

      const d = new Map();
      const p = new Map();
      const vis = new Map();

      const getOrPut = (m) => (key, value) => {
        if (!m.has(key)) m.set(key, value);

        return m.get(key);
      };

      d.set(source, 0);

      const heap = new PriorityQueue((a, b) => {
        return a.distance - b.distance;
      });

      heap.enq({
        label: source,
        distance: 0,
      });

      while (!heap.isEmpty()) {
        const t = heap.deq();

        if (getOrPut(vis)(t.label, false) === true) continue;

        vis.set(t.label, true);

        for (const node of this.edges[t.label]) {
          const vertex = node.vertex;
          const distance = node.distance;

          if (
            getOrPut(d)(vertex, 0x3f3f3f) >
            getOrPut(d)(t.label, 0x3f3f3f) + distance
          ) {
            d.set(vertex, d.get(t.label) + distance);
            p.set(vertex, t.label);

            heap.enq({
              label: vertex,
              distance: d[vertex],
            });
          }
        }
      }

      const reverse = (arr) => {
        let r = [];

        for (let i = arr.length - 1; i >= 0; i--) r.push(arr[i]);

        return r;
      };

      let t = p.get(target);
      let rp = [target];

      while (p.has(t)) {
        rp.push(t);
        t = p.get(t);
      }

      rp.push(source);

      return {
        distance: d.get(target),
        distanceMap: d,
        path: reverse(rp),
      };
    },
    getPathDescription(label, distance) {
      if (distance === 0) {
        return "当前位置";
      } else {
        return `预计步行时间: ${this.estimateTime(distance)} 分钟`;
      }
    },
    getPathIcon(label) {
      const marker = this.findMarkerByLabel(label);

      if (marker.type === "道路标记") {
        return "road";
      } else {
        return "gamepad";
      }
    },
    estimateTime(distance) {
      return Math.round(distance / 55.4);
    },
    generateSource() {
      return labels.map((v) => {
        return {
          title: v["label"],
        };
      });
    },
    handleSearch(value) {
      for (const label of labels) {
        if (label["label"] === value["title"]) {
          this.handleLabelClick(label);
          return;
        }
      }
    },
  },
};
</script>

<style lang="scss">
body {
  overflow-y: hidden;
}

.root-container {
  position: relative;
  background: #bad588;

  .control-layer {
    position: absolute;
    z-index: 100;

    .top-left-control-bar {
      position: fixed;
      left: 8px;
      top: 8px;
      display: flex;
      flex-direction: column;
      width: 350px;

      .search-input {
        width: 100%;

        .prompt {
          border-radius: 3px !important;
        }
      }

      .detail {
        width: 350px;

        .vote {
          padding: 8px 0;
          display: flex;
          align-items: center;
        }

        .description {
          box-sizing: border-box;
          padding: 8px 12px;
          text-align: left;
          height: 130px;
          overflow-y: auto;
        }

        .wait-info {
          display: flex;
          flex-direction: column;
          justify-content: center;

          > div {
            padding: 6px 4px;
          }
        }
      }

      .current-position {
        width: 350px;

        font-weight: bold;
        letter-spacing: 3px;
        margin: 0.8em 0 0 0;
      }

      .current-best {
        width: 350px;
        font-weight: bold;
        letter-spacing: 3px;

        .content {
          padding: 12px 0;
        }

        margin: 0.8em 0 0 0;
      }
    }

    .bottom-right-control-bar {
      position: fixed;
      bottom: 8px;
      right: 8px;
      display: flex;
      align-items: baseline;

      button {
        margin-right: 8px;
      }
    }

    .top-right-control-bar {
      position: fixed;
      right: 8px;
      top: 8px;

      .header {
        font-weight: bold;
        font-size: 22px;
        padding: 16px 0;
      }

      .card > .content {
        overflow-y: auto;
        overflow-x: hidden;
        height: 600px;
        box-sizing: border-box;
        padding: 8px 0;
        background: transparent;
      }

      .step > .content {
        flex-grow: 1 !important;
      }
    }
  }
}
</style>
