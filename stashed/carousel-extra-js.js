					image: function() {
				        return this.$_find('.item.active img').map(function(img) {
				            var $img = this.$element.find(".item.active img"), pos = {
				                left: $img.position().left,
				                right: $img.position().left
				            };
				            if ($.support.transition) {
				                this.$element.find(".carousel-caption").animate(pos);
				            } else {
				                this.$element.find(".carousel-caption").css(pos);
				            }
				        });
				    },

				    fit: function(show, evt) {

						var comp     = show.root();
						var state    = comp.state('slides');

				    	var element  = state.$el.querySelector(state.curr);
				    	var height   = element.style.height;

				        if (height != state.$el.height) {
				        	state.$el.style.heigth = height;
				        }

				    },
				    
					updateCarouselTopMargin: function(show) {

					    var $parent = $carousel.parents(".modal:first"),
					    	needHeadingHandle = !$parent.hasClass("force-fullscreen"),
					    	parentFreeSpace = $parent.height();

					    if (needHeadingHandle) {
					        parentFreeSpace = parentFreeSpace - $(".modal-header", $parent).height();
					        parentFreeSpace = parentFreeSpace - $(".modal-footer", $parent).height();
					    }
					    if ($.support.transition && $carousel.hasClass("slide")) {
					        $carousel.animate({
					            marginTop: (parentFreeSpace - height) / 2
					        });
					    } else {
					        $carousel.css({
					            marginTop: (parentFreeSpace - height) / 2
					        });
					    }
					}