class RangeSlider {
	constructor(opts) {
		this.opts = opts = Object.assign(
			{
				min: 0,
				max: 100,
				step: 1,
				value: [ 1, 10 ],
				onChange() {},
				onPointPosition() {}
			},
			opts
		);

		if (typeof opts.el === 'string') {
			this.el = opts.el = document.querySelector(opts.el);
		}

		this.init();
	}

	init() {
		this.handleDragstart = this.handleDragstart.bind(this);
		this.handleDrag = this.handleDrag.bind(this);
		this.handleDragover = this.handleDragover.bind(this);
		this.resize = this.resize.bind(this);

		this.resize();
		this.renderProcess();
		this.renderPoints();
		this.listen();
		this.updateProcess();
	}

	getCurrentValue() {
		return this.points.map((p) => p.value);
	}
	saveValue(value) {
		let { min, max } = this.opts;
		return Math.max(min, Math.min(max, value));
	}
	updateProcess() {
		let range = this.points.map((p) => p.position);
		let left, right;
		if (range.length <= 1) {
			left = 0;
			right = 100 - range[0];
		} else {
			left = Math.min(...range);
			right = 100 - Math.max(...range);
		}
		this.process.style.left = left + '%';
		this.process.style.right = right + '%';
	}
	positionPoint(point, value) {
		let { min, step } = this.opts;
		let offsetValue = Math.ceil((value - min) / step) / this.pointCount * 100;

		point.value = value;
		point.position = offsetValue;
		point.style.left = offsetValue + '%';

		this.opts.onPointPosition(offsetValue);
	}
	setValue(value) {
		this.points.forEach((point, index) => {
			this.positionPoint(point, this.saveValue(value[index]));
		});

		this.updateProcess();
		this.opts.onChange(this.getCurrentValue());
	}

	resize() {
		let { max, min, step, el } = this.opts;
		this.pointCount = Math.ceil((max - min) / step);
		this.stepWidth = el.offsetWidth / this.pointCount;
	}

	handleDragstart(e) {
		e.preventDefault();

		let point = this.points.find((p) => p === e.target);
		if (point && e.button === 0) {
			point.classList.add('y-point-active');
			this.movePoint = {
				el: point,
				x: e.pageX,
				value: point.value
			};
		}
	}
	handleDrag(e) {
		e.preventDefault();
		if (!this.movePoint) return;

		let moveX = e.pageX - this.movePoint.x;
		let increment =
			Math.ceil((Math.abs(moveX) - this.stepWidth / 2) / this.stepWidth) * this.opts.step;
		let dir = moveX > 0 ? 1 : -1;
		let newValue = this.saveValue(this.movePoint.value + increment * dir);

		if (newValue !== this.movePoint.el.value) {
			this.positionPoint(this.movePoint.el, newValue);
			this.updateProcess();
			this.opts.onChange(this.getCurrentValue());
		}
	}
	handleDragover(e) {
		e.preventDefault();
		if (this.movePoint) {
			this.movePoint.el.classList.remove('y-point-active');
			this.movePoint = undefined;
		}
	}

	listen(fn = 'add') {
		fn = fn + 'EventListener';

		this.opts.el[fn]('mousedown', this.handleDragstart);
		document[fn]('mousemove', this.handleDrag);
		document[fn]('mouseup', this.handleDragover);
		window[fn]('resize', this.resize);
	}
	destory() {
		this.listen('remove');
	}

	renderProcess() {
		let processNode = document.createElement('div');
		processNode.className = 'y-process';
		this.process = processNode;

		this.opts.el.appendChild(processNode);
	}
	renderPoints() {
		this.points = this.opts.value.map((v, index) => {
			let pointNode = document.createElement('div');
			pointNode.className = 'y-point';
			pointNode.index = index;

			this.positionPoint(pointNode, this.saveValue(v));
			this.opts.el.appendChild(pointNode);

			return pointNode;
		});
	}
}
