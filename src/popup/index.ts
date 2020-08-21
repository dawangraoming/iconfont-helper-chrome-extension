/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @date 2018/6/25
 */
///<reference path="../iconfont-helper.d.ts"/>
import './style.scss';

const Vue =
	process.env.NODE_ENV === 'development'
		? require('../../node_modules/vue/dist/vue.js')
		: require('../../node_modules/vue/dist/vue.min.js');

const app = new Vue({
	el: '#root',
	data() {
		return {
			throttleHandler: 0,
			// 当前站点是否支持
			isSupport: false,
			// 保存类型
			saveTypes: ['svg', 'png', 'jpg', 'webp'],
			// 图标大小
			iconSize: +localStorage.getItem('_icon_font_site_') || 200,
			// 图标颜色
			iconColor: localStorage.getItem('_icon_font_color_') || ''
		};
	},
	filters: {
		uppercase(text: string) {
			return text.toString().toUpperCase();
		}
	},
	methods: {
		/**
		 * 发送消息到当前页面中
		 * @param data {object}
		 * @param data.type {string} 事件类型
		 */
		sendMessage(data: IconFontHelper.MessageType) {
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				const params = Object.assign({ target: 'content' }, data);
				// 向当前标签发出请求
				chrome.tabs.sendMessage(tabs[0].id, params, function(response) {
					console.log('response =>' + response);
				});
			});
		},
		/**
		 * 选择图标操作
		 * @param type
		 */
		select(type: string) {
			return this.sendMessage({ type });
		},
		/**
		 * 下载事件
		 * @param type
		 */
		download(type: string) {
			return this.sendMessage({
				type: `download-${type}`,
				size: this.iconSize
			});
		},
		/**
		 * 设置图标颜色
		 * @param color
		 */
		setColor(color: string) {
			localStorage.setItem('_icon_font_color_', color);
			this.sendMessage({ type: 'set-icon-color', color });
		},
		/**
		 * 应用颜色
		 */
		applyColor() {
			this.setColor(this.iconColor);
		},
		/**
		 * 重置颜色
		 */
		resetColor() {
			this.setColor('');
		}
	},
	watch: {
		iconSize(newVal: string, oldVal: string) {
			clearTimeout(this.throttleHandler);
			if (newVal === oldVal) return;
			// 数据变更时，等待一定时间后再进行数据存储
			this.throttleHandler = window.setTimeout(() => localStorage.setItem('_icon_font_site_', newVal), 200);
		}
	},
	created() {
		// 获取当前页面地址
		chrome &&
			chrome.tabs &&
			chrome.tabs.query &&
			chrome.tabs.query({ active: true }, tabs => {
				const tab = tabs[0];
				const url = tab.url;
				// 判断是否在iconfont站点内
				this.isSupport = /^https?:\/\/(www.)?iconfont.cn/.test(url);
			});
	}
});
