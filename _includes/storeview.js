        <script type="text/javascript">
        /*<![CDATA[*/
        (function () {
          var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
          if (window.ShopifyBuy) {
            if (window.ShopifyBuy.UI) {
              ShopifyBuyInit();
            } else {
              loadScript();
            }
          } else {
            loadScript();
          }
          function loadScript() {
            var script = document.createElement('script');
            script.async = true;
            script.src = scriptURL;
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
            script.onload = ShopifyBuyInit;
          }
          function ShopifyBuyInit() {
            var client = ShopifyBuy.buildClient({
              domain: 'fab-babydictators.myshopify.com',
              storefrontAccessToken: '98877a7f521b34b71b666f25f352bb48',
            });
            ShopifyBuy.UI.onReady(client).then(function (ui) {
              ui.createComponent('collection', {
                id: '{{shopify_collection_id}}',
                node: document.getElementById('collection-component-1575574611446'),
                moneyFormat: '%24%7B%7Bamount%7D%7D',
                options: {
          "product": {
            "styles": {
              "product": {
                "@media (min-width: 601px)": {
                  "max-width": "calc(25% - 20px)",
                  "margin-left": "20px",
                  "margin-bottom": "50px",
                  "width": "calc(25% - 20px)"
                },
                "img": {
                  "height": "calc(100% - 15px)",
                  "position": "absolute",
                  "left": "0",
                  "right": "0",
                  "top": "0"
                },
                "imgWrapper": {
                  "padding-top": "calc(75% + 15px)",
                  "position": "relative",
                  "height": "0"
                }
              },
              "button": {
                "font-size": "16px",
                "padding-top": "16px",
                "padding-bottom": "16px",
                "width": "100%",
                ":hover": {
                  "background-color": "#e65d00"
                },
                "background-color": "#ff6700",
                ":focus": {
                  "background-color": "#e65d00"
                },
                "border-radius": "0px",
                "padding-left": "41px",
                "padding-right": "41px"
              },
              "quantityInput": {
                "font-size": "16px",
                "padding-top": "16px",
                "padding-bottom": "16px"
              }
            },
            "text": {
              "button": "Add to cart"
            }
          },
          "productSet": {
            "styles": {
              "products": {
                "@media (min-width: 601px)": {
                  "margin-left": "-20px"
                }
              }
            }
          },
          "modalProduct": {
            "contents": {
              "img": false,
              "imgWithCarousel": true,
              "button": false,
              "buttonWithQuantity": true
            },
            "styles": {
              "product": {
                "@media (min-width: 601px)": {
                  "max-width": "100%",
                  "margin-left": "0px",
                  "margin-bottom": "0px"
                }
              },
              "button": {
                "font-size": "16px",
                "padding-top": "16px",
                "padding-bottom": "16px",
                ":hover": {
                  "background-color": "#e65d00"
                },
                "background-color": "#ff6700",
                ":focus": {
                  "background-color": "#e65d00"
                },
                "border-radius": "13px",
                "padding-left": "41px",
                "padding-right": "41px"
              },
              "quantityInput": {
                "font-size": "16px",
                "padding-top": "16px",
                "padding-bottom": "16px"
              }
            },
            "text": {
              "button": "Add to cart"
            }
          },
          "cart": {
            "styles": {
              "button": {
                "font-size": "16px",
                "padding-top": "16px",
                "padding-bottom": "16px",
                ":hover": {
                  "background-color": "#e65d00"
                },
                "background-color": "#ff6700",
                ":focus": {
                  "background-color": "#e65d00"
                },
                "border-radius": "13px"
              }
            },
            "text": {
              "total": "Subtotal",
              "button": "Checkout"
            }
          },
          "toggle": {
            "styles": {
              "toggle": {
                "background-color": "#ff6700",
                ":hover": {
                  "background-color": "#e65d00"
                },
                ":focus": {
                  "background-color": "#e65d00"
                }
              },
              "count": {
                "font-size": "16px"
              }
            }
          }
        },
              });
            });
          }
        })();
        /*]]>*/
        </script>
