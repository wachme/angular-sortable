angular.module('sortable', [])

    .directive('sortableList', function() {
        return {
            restrict: 'AC',
            scope: {
                update: '&'
            },
            controller: function($scope, $element) {
                var element = $element[0];

                this.update = function() {
                    $scope.$emit('sortableUpdate');
                };
                this.onUpdate = function(cb) {
                    $scope.$on('sortableUpdate', cb.bind(this));
                };

                this.items = function() {
                    return element.children;
                };
            },
            link: function(scope, el, attrs) {
                var element = el[0];

                element.addEventListener('dragover', function(e) {
                    e.preventDefault();
                });
                element.addEventListener('drop', function(e) {
                    e.preventDefault();
                    alert(e.clientX);
                });
            }
        };
    })

    .directive('sortableItem', function() {
        return {
            restrict: 'AC',
            scope: {
                model: '='
            },
            require: '^sortableList',
            link: function(scope, el, attrs, listCtrl) {
                var element = el[0];
                var list = element.parentNode;
                var isDragged, dX, dY, wrapEl, beforeEl, placeholderEl;

                function index() {
                    var elements = Array.prototype.slice.call(listCtrl.items());
                    return elements.indexOf(element);
                }

                function insertEl(el) {
                    list.appendChild(el);
                    list.insertBefore(el, beforeEl);
                }

                listCtrl.onUpdate(function() {
                    scope.$apply(function() {
                        scope.model = index();
                    });
                });

                element.addEventListener('mousedown', function(e) {
                    var x = e.clientX;
                    var y = e.clientY;
                    var w = element.offsetWidth;
                    var h = element.offsetHeight;

                    var rect = element.getBoundingClientRect();
                    dX = x - rect.left;
                    dY = y - rect.top;

                    placeholderEl = document.createElement(element.tagName);
                    placeholderEl.className = 'sortable-placeholder';

                    beforeEl = element;
                    insertEl(placeholderEl);

                    wrapEl = document.createElement('div');
                    document.body.appendChild(wrapEl);
                    wrapEl.appendChild(element);
                    wrapEl.style.position = 'absolute';
                    wrapEl.style.width = w + 'px';
                    wrapEl.style.height = h + 'px';

                    isDragged = true;
                });

                document.addEventListener('mousemove', function(e) {
                    if(!isDragged) return;

                    var x = e.clientX;
                    var y = e.clientY;
                    wrapEl.style.left = (x - dX) + 'px';
                    wrapEl.style.top = (y - dY) + 'px';

                    var items = listCtrl.items();

                    var last = items[items.length - 1];
                    if(y > last.getBoundingClientRect().top + last.offsetHeight)
                        beforeEl = null;
                    else {
                        var minDiff = Number.MAX_VALUE;
                        for(var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if(item == placeholderEl)
                                continue;

                            var top = item.getBoundingClientRect().top + item.offsetHeight;
                            var diff = top - y;
                            if(diff >= 0 && diff < minDiff) {
                                beforeEl = item;
                                minDiff = diff;
                            }
                        }
                    }
                    insertEl(placeholderEl);
                });

                document.addEventListener('mouseup', function(e) {
                    if(!isDragged)
                        return;

                    isDragged = false;
                    list.removeChild(placeholderEl);

                    insertEl(element);
                    document.body.removeChild(wrapEl);

                    listCtrl.update();
                });
            }
        };
    });