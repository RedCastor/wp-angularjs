'use strict';

var wp = angular.module( "wp", [ "wp.services", "ngResource", "ngSanitize" ] );

/**
 * <have-posts></have-posts>
 *
 * @description
 * WordPress loop
 *
 * ## Example
 *
 * ```
 * <thave-posts api-root="http://example.com" post-type="posts">
 *   <h2 class="entry-title"><the-title></the-title></h2>
 *   <div class="entry-content"><the-content></the-content></div>
 * </have-posts>
 * ```
 *
 * ## Attributes
 * | Attribute | Type   | Details                                                        |
 * |-----------|--------|----------------------------------------------------------------|
 * | api-root  | string | Root url of the API. e.g. http://example.com/wp-json/wp/v2     |
 * | post-type | string | `posts` or `pages` or `media` or custom post type              |
 */
wp.directive( "havePosts", [ "WP_Query", function( WP_Query ) {
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		scope: {
			postType: '@',
			postId: '@',
			apiRoot: '@',
		},
		controller: [ "$scope", function( $scope ) {
			// nothing to do, but we need here
		} ],
		compile: function( tElement, tAttrs, transclude ) {
			return {
				pre: function preLink( scope, element, attrs, controller ) {
					scope.posts = [];
					if ( scope.postId ) {
						scope.query = {
							'endpoint': scope.postType,
							'id': scope.postId
						}
						WP_Query( scope.apiRoot ).get( scope.query ).$promise
								.then( function( posts ) {
							scope.posts.push( posts );
						} );
					} else {
						scope.query = {
							'endpoint': scope.postType,
							'per_page': 10,
							'offset': 0,
							'filter[orderby]': 'date',
							'filter[order]': 'DESC',
							'_embed': true
						}
						WP_Query( scope.apiRoot ).query( scope.query ).$promise
								.then( function( posts ) {
							scope.posts = posts;
						} );
					}
				}
			}
		},
		template: "<div class=\"have-posts\"><article class=\"{{ postType }}"
					+ " post-{{ post.id }}\" ng-repeat=\"post in posts\">"
						+ "<div ng-transclude></div></article></div>"
	}
} ] );


/**
 * <the-title></the-title>
 *
 * @description
 * Displays the post title of the current post.
 *
 * ## Example
 *
 * ```
 * HTML: <the-title></the-title>
 * Result: <div class="the-title">Hello World</div>
 * ```
 */
wp.directive( "theTitle", [ "$sce", function( $sce ) {
	return{
		restrict:'E',
		replace: true,
		require : '^havePosts',
		transclude: true,
		compile: function( tElement, tAttrs, transclude ) {
			return {
				post: function postLink( scope, element, attrs, controller ) {
					scope.title = scope.$parent.post.title.rendered;
				}
			}
		},
		template: "<div class=\"the-title\" ng-bind-html=\"title\">{{ title }}</div>"
	}
} ] );


/**
 * <the-content></the-content>
 *
 * @description
 * Displays the post content of the current post.
 *
 * ## Example
 *
 * ```
 * HTML: <the-content></the-content>
 * Result: <div class="the-content"><p>Hello World</p></div>
 * ```
 */
wp.directive( "theContent", [ "$sce", function( $sce ) {
	return{
		restrict:'E',
		replace: true,
		require : '^havePosts',
		compile: function( tElement, tAttrs, transclude ) {
			return {
				post: function postLink( scope, element, attrs, controller ) {
					var post = scope.$parent.post;
					scope.content = $sce.trustAsHtml( post.content.rendered );
				}
			}
		},
		template: "<div class=\"the-content\" ng-bind-html=\"content\">"
						+ "{{ content }}</div>"
	}
} ] );


/**
 * <the-post-thumbnail></the-post-thumbnail>
 *
 * @description
 * Displays the post thumbnail of the current post.
 *
 * ## Example
 *
 * ```
 * HTML: <the-post-thumbnail></the-post-thumbnail>
 * Result: <div class="the-post-thumbnail"><img src="http://example.com/image.jpg"></div>
 * ```
 *
 * Sets the size `full`, so post thumbnail's size will be `full`.
 * ```
 * HTML: <the-post-thumbnail size="full"></the-post-thumbnail>
 * Result: <div class="the-post-thumbnail"><img src="http://example.com/image.jpg"></div>
 * ```
 *
 * ## Attributes
 * | Attribute | Type   | Details                                                        |
 * |-----------|--------|----------------------------------------------------------------|
 * | size      | string | Size of the post thumbnail. Default is `full`.                 |
 */
wp.directive( "thePostThumbnail", [ function() {
	return{
		restrict:'E',
		replace: true,
		require : '^havePosts',
		compile: function( tElement, tAttrs, transclude ) {
			return {
				post: function postLink( scope, element, attrs, controller ) {
					if ( ! attrs.size ) {
						attrs.size = 'post-thumbnail';
					}
					var scheme = 'https://api.w.org/featuredmedia';
					var _embedded = scope.$parent.post._embedded;
					var img;
					if ( _embedded && _embedded[scheme] && _embedded[scheme].length ) {
						if ( _embedded[scheme][0].media_details.sizes[attrs.size] ) {
							img = _embedded[scheme][0].media_details
									.sizes[attrs.size].source_url;
						} else {
							img = _embedded[scheme][0].media_details
									.sizes['full'].source_url;
						}
					}
					if ( img ) {
						scope.image_src = img;
					}
				}
			}
		},
		template: "<div class=\"the-post-thumbnail\">"
						+ "<img ng-src=\"{{ image_src }}\"></div>"
	}
} ] );


/**
 * <the-id></the-id>
 *
 * @description
 * Displays the ID of the current post.
 *
 * ```
 * HTML: <the-id></the-id>
 * Result: <div class="the-id">123</div>
 * ```
 */
wp.directive( "theId", [ function() {
	return{
		restrict:'E',
		replace: true,
		require : '^havePosts',
		compile: function( tElement, tAttrs, transclude ) {
			return {
				post: function postLink( scope, element, attrs, controller ) {
					scope.post_id = scope.$parent.post.id;
				}
			}
		},
		template: "<div class=\"the-id\">{{ post_id }}</div>"
	}
} ] );