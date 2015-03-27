window.onload = function () {
	// hui.Template._parse = hui.Template.parse;
	// hui.Template.parseAuto = function (elem, data) {
	// 	elem.innerHTML = hui.Template._parse(elem.innerHTML, user_data);
	// };
	var user_data = {
		latest_list: [{
			img: 'img/avatar1.jpg',
			update: 'update',
			version: 'crystal/plugins@1.0.0',
			time: 'an hour ago'
		}, {
			img: 'img/avatar1.jpg',
			update: 'update',
			version: 'crystal/crystal@ 1.0.0',
			time: 'an hour ago'
		}, {
			img: 'img/avatar2.jpg',
			update: 'update',
			version: 'alinw/kuma-table@ 2.1.0',
			time: '3 hours ago'
		}, {
			img: 'img/avatar2.jpg',
			update: 'update',
			version: 'alinw/kuma-crumbs@ 2.1.0',
			time: '3 hours ago'
		}, {
			img: 'img/avatar2.jpg',
			update: 'update',
			version: 'alinw/kuma-table@ 2.1.0',
			time: '4 hours ago'
		}],

		pack_list: [{
			name: 'arale/widget',
			num: '30 packages'
		}, {
			name: 'jquery/jquery',
			num: '28 packages'
		}, {
			name: 'gallery/handlebars',
			num: '21 packages'
		}, {
			name: 'arale/base',
			num: '20 packages'
		}, {
			name: 'arale/templatable',
			num: '12 packages'
		}, {
			name: 'gallery/underscore',
			num: '12 packages'
		}, {
			name: 'arale/position',
			num: '11 packages'
		}, {
			name: 'arale/easing',
			num: '10 packages'
		}, {
			name: 'arale/overlay',
			num: '10 packages'
		}, {
			name: 'arale/popup',
			num: '9 packages'
		}],

		pack_list2: [{
			name: 'ck0123456',
			num: '89 packages'
		}, {
			name: 'flyingsesame',
			num: '84 packages'
		}, {
			name: 'yize',
			num: '78 packages'
		}, {
			name: 'slate',
			num: '60 packages'
		}, {
			name: 'crossjs',
			num: '47 packages'
		}, {
			name: 'gallery',
			num: '45 packages'
		}, {
			name: 'wuqiong7',
			num: '43 packages'
		}, {
			name: 'jinhong',
			num: '41 packages'
		}, {
			name: 'bustling',
			num: '37 packages'
		}, {
			name: 'atans',
			num: '34 packages'
		}]
	};

	var table = {
		company: 'hujiang',

		list: [{
			name: 'aa',
			age: '11'
		}, {
			name: 'bb',
			age: 22
		}, {
			name: 'cc',
			age: '33'
		}]
	}



	// user_tmpl.style.display = 'none';
	var latest_tmpl = document.getElementById('latest_list').innerHTML;
	var pack_tmpl = document.getElementById('packages_list').innerHTML;
	var pack_tmpl2 = document.getElementById('packages_list2').innerHTML;
	document.getElementById('latest_list').innerHTML = hui.Template.parse(latest_tmpl, user_data);
	document.getElementById('packages_list').innerHTML = hui.Template.parse(pack_tmpl, user_data);
	document.getElementById('packages_list2').innerHTML = hui.Template.parse(pack_tmpl2, user_data);

	var tr1_tmpl = document.getElementById('tr1').innerHTML;
	var tb1_tmpl = document.getElementById('tb1').innerHTML;
	document.getElementById('tr1').innerHTML = hui.Template.parse(tr1_tmpl, table);
	document.getElementById('tb1').innerHTML = hui.Template.parse(tb1_tmpl, table);
}