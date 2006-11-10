


(function() {

var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;


/**
* The Menu class creates a container that holds a vertical list representing a set of options or commands.  Menu is the base class for all menu containers. 
* @param {String} p_oElement String specifying the id attribute of the <code>&#60;div&#62;</code> element of the menu.
* @param {String} p_oElement String specifying the id attribute of the <code>&#60;select&#62;</code> element to be used as the data source for the menu.
* @param {<a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-22445964">HTMLDivElement</a>} p_oElement Object specifying the <code>&#60;div&#62;</code> element of the menu.
* @param {<a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-94282980">HTMLSelectElement</a>} p_oElement Object specifying the <code>&#60;select&#62;</code> element to be used as the data source for the menu.
* @param {Object} p_oConfig Optional. Object literal specifying the configuration for the menu. See configuration class documentation for more details.
* @namespace YAHOO.widget
* @class Menu
* @constructor
* @extends YAHOO.widget.Overlay
*/
YAHOO.widget.Menu = function(p_oElement, p_oConfig) {

    if(p_oConfig) {

        this.parent = p_oConfig.parent;

        this.lazyLoad = p_oConfig.lazyLoad || p_oConfig.lazyload;

        this.itemData = p_oConfig.itemData || p_oConfig.itemdata;

    }


    YAHOO.widget.Menu.superclass.constructor.call(
        this, 
        p_oElement, 
        p_oConfig
    );

};

YAHOO.extend(YAHOO.widget.Menu, YAHOO.widget.Overlay, {



// Constants


/**
* @property CSS_CLASS_NAME
* @description String representing the CSS class(es) to be applied to the menu's <code>&#60;div&#62;</code> element.
* @default "yuimenu"
* @final
* @type String
*/
CSS_CLASS_NAME: "yuimenu",


/**
* @property ITEM_TYPE
* @description Object representing the type of menu item to instantiate and add when parsing the child nodes (either <code>&#60;li&#62;</code> element, <code>&#60;optgroup&#62;</code> element or <code>&#60;option&#62;</code>) of the menu's source HTML element.
* @default YAHOO.widget.MenuItem
* @final
* @type YAHOO.widget.MenuItem
*/
ITEM_TYPE: null,


/**
* @property GROUP_TITLE_TAG_NAME
* @description String representing the tagname of the HTML element used to title the menu's item groups.
* @default H6
* @final
* @type String
*/
GROUP_TITLE_TAG_NAME: "h6",



// Private properties


/** 
* @property _nHideDelayId
* @description Number representing the time-out setting used to cancel the hiding of a menu.
* @default null
* @private
* @type Number
*/
_nHideDelayId: null,


/** 
* @property _nShowDelayId
* @description Number representing the time-out setting used to cancel the showing of a menu.
* @default null
* @private
* @type Number
*/
_nShowDelayId: null,


/** 
* @property _hideDelayEventHandlersAssigned
* @description Boolean indicating if the "mouseover" and "mouseout" event handlers used for hiding the menu via a call to "window.setTimeout" have already been assigned.
* @default false
* @private
* @type Boolean
*/
_hideDelayEventHandlersAssigned: false,


/**
* @property _bHandledMouseOverEvent
* @description Boolean indicating the current state of the menu's "mouseover" event.
* @default false
* @private
* @type Boolean
*/
_bHandledMouseOverEvent: false,


/**
* @property _bHandledMouseOutEvent
* @description Boolean indicating the current state of the menu's "mouseout" event.
* @default false
* @private
* @type Boolean
*/
_bHandledMouseOutEvent: false,


/**
* @property _aGroupTitleElements
* @description Array of HTML element used to title groups of menu items.
* @default []
* @private
* @type Array
*/
_aGroupTitleElements: null,


/**
* @property _aItemGroups
* @description Array of menu items.
* @default []
* @private
* @type Array
*/
_aItemGroups: null,


/**
* @property _aListElements
* @description Array of <code>&#60;ul&#62;</code> elements, each of which is the parent node for each item's <code>&#60;li&#62;</code> element.
* @default []
* @private
* @type Array
*/
_aListElements: null,



// Public properties


/**
* @property lazyLoad
* @description Boolean indicating if the menu's "lazy load" feature is enabled.  If set to "true," initialization and rendering of the menu's items will be deferred until the first time it is made visible.  This property should be set via the constructor using the configuration object literal.
* @default false
* @type Boolean
*/
lazyLoad: false,


/**
* @property itemData
* @description Array of items to be added to the menu.  The array can contain strings representing the text for each item to be created, object literals representing the menu item configuration properties, or MenuItem instances.  This property should be set via the constructor using the configuration object literal.
* @default null
* @type Array
*/
itemData: null,


/**
* @property activeItem
* @description Object reference to the item in the menu that has focus.
* @default null
* @type YAHOO.widget.MenuItem
*/
activeItem: null,


/**
* @property parent
* @description Object reference to the menu's parent menu or menu item.  This property can be set via the constructor using the configuration object literal.
* @default null
* @type YAHOO.widget.MenuItem
*/
parent: null,


/**
* @property srcElement
* @description Object reference to the HTML element (either <code>&#60;select&#62;</code> or <code>&#60;div&#62;</code>) used to create the menu.
* @default null
* @type <a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-94282980">HTMLSelectElement</a>|<a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-22445964">HTMLDivElement</a>
*/
srcElement: null,



// Events


/**
* @event mouseOverEvent
* @description Fires when the mouse has entered the menu.  Passes back the DOM Event object as an argument.
*/
mouseOverEvent: null,


/**
* @event mouseOutEvent
* @description Fires when the mouse has left the menu.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
mouseOutEvent: null,


/**
* @event mouseDownEvent
* @description Fires when the user mouses down on the menu.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
mouseDownEvent: null,


/**
* @event mouseUpEvent
* @description Fires when the user releases a mouse button while the mouse is over the menu.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
mouseUpEvent: null,


/**
* @event clickEvent
* @description Fires when the user clicks the on the menu.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
clickEvent: null,


/**
* @event keyPressEvent
* @description Fires when the user presses an alphanumeric key when one of the menu's items has focus.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
keyPressEvent: null,


/**
* @event keyDownEvent
* @description Fires when the user presses a key when one of the menu's items has focus.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
keyDownEvent: null,


/**
* @event keyUpEvent
* @description Fires when the user releases a key when one of the menu's items has focus.  Passes back the DOM Event object as an argument.
* @type YAHOO.util.CustomEvent
*/
keyUpEvent: null,


/**
* @event itemAddedEvent
* @description Fires when an item is added to the menu.
* @type YAHOO.util.CustomEvent
*/
itemAddedEvent: null,


/**
* @event itemRemovedEvent
* @description Fires when an item is removed to the menu.
* @type YAHOO.util.CustomEvent
*/
itemRemovedEvent: null,


/**
* @method init
* @description The Menu class's initialization method. This method is automatically called by the constructor, and sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @param {String} p_oElement String specifying the id attribute of the <code>&#60;div&#62;</code> element of the menu.
* @param {String} p_oElement String specifying the id attribute of the <code>&#60;select&#62;</code> element to be used as the data source for the menu.
* @param {<a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-22445964">HTMLDivElement</a>} p_oElement Object specifying the <code>&#60;div&#62;</code> element of the menu.
* @param {<a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-94282980">HTMLSelectElement</a>} p_oElement Object specifying the <code>&#60;select&#62;</code> element to be used as the data source for the menu.
* @param {Object} p_oConfig Optional. Object literal specifying the configuration for the menu. See configuration class documentation for more details.
*/
init: function(p_oElement, p_oConfig) {

    this._aItemGroups = [];
    this._aListElements = [];
    this._aGroupTitleElements = [];


    if(!this.ITEM_TYPE) {

        this.ITEM_TYPE = YAHOO.widget.MenuItem;

    }


    var oElement;

    if(typeof p_oElement == "string") {

        oElement = document.getElementById(p_oElement);

    }
    else if(p_oElement.tagName) {

        oElement = p_oElement;

    }


    if(oElement && oElement.tagName) {

        switch(oElement.tagName.toUpperCase()) {
    
            case "DIV":

                this.srcElement = oElement;

                if(!oElement.id) {

                    oElement.setAttribute("id", Dom.generateId());

                }


                /* 
                    Note: we don't pass the user config in here yet 
                    because we only want it executed once, at the lowest 
                    subclass level.
                */ 
            
                YAHOO.widget.Menu.superclass.init.call(this, oElement);

                this.beforeInitEvent.fire(YAHOO.widget.Menu);

                this.logger = new YAHOO.widget.LogWriter(this.toString());

                this.logger.log("Source element: " + this.srcElement.tagName);
    
            break;
    
            case "SELECT":
    
                this.srcElement = oElement;

    
                /*
                    The source element is not something that we can use 
                    outright, so we need to create a new Overlay

                    Note: we don't pass the user config in here yet 
                    because we only want it executed once, at the lowest 
                    subclass level.
                */ 

                YAHOO.widget.Menu.superclass.init.call(this, Dom.generateId());

                this.beforeInitEvent.fire(YAHOO.widget.Menu);

                this.logger = new YAHOO.widget.LogWriter(this.toString());

                this.logger.log("Source element: " + this.srcElement.tagName);

            break;

        }

    }
    else {

        /* 
            Note: we don't pass the user config in here yet 
            because we only want it executed once, at the lowest 
            subclass level.
        */ 
    
        YAHOO.widget.Menu.superclass.init.call(this, p_oElement);

        this.beforeInitEvent.fire(YAHOO.widget.Menu);

        this.logger = new YAHOO.widget.LogWriter(this.toString());

        this.logger.log("No source element found.  " +
            "Created element with id: " + this.id);

    }


    if(this.element) {

        var oEl = this.element;

        Dom.addClass(oEl, this.CSS_CLASS_NAME);


        // Subscribe to Custom Events

        this.initEvent.subscribe(this._onInit, this, true);
        this.beforeRenderEvent.subscribe(this._onBeforeRender, this, true);
        this.renderEvent.subscribe(this._onRender, this, true);
        this.beforeShowEvent.subscribe(this._onBeforeShow, this, true);
        this.showEvent.subscribe(this._onShow, this, true);
        this.beforeHideEvent.subscribe(this._onBeforeHide, this, true);
        this.mouseOverEvent.subscribe(this._onMouseOver, this, true);
        this.mouseOutEvent.subscribe(this._onMouseOut, this, true);
        this.clickEvent.subscribe(this._onClick, this, true);
        this.keyDownEvent.subscribe(this._onKeyDown, this, true);


        if(p_oConfig) {
    
            this.cfg.applyConfig(p_oConfig, true);
    
        }


        // Register the Menu instance with the MenuManager

        YAHOO.widget.MenuManager.addMenu(this);
        

        this.initEvent.fire(YAHOO.widget.Menu);

    }

},



// Private methods


/**
* @method _initSubTree
* @description Iterates the childNodes of the source element to find nodes used to instantiate menu and menu items.
* @private
*/
_initSubTree: function() {

    var oNode;

    if(this.srcElement.tagName == "DIV") {

        /*
            Populate the collection of item groups and item
            group titles
        */

        oNode = this.body.firstChild;
        var nGroup = 0;

        do {

            if(oNode && oNode.tagName) {

                switch(oNode.tagName.toUpperCase()) {

                    case this.GROUP_TITLE_TAG_NAME:
                    
                        this._aGroupTitleElements[nGroup] = oNode;

                    break;

                    case "UL":

                        this._aListElements[nGroup] = oNode;
                        this._aItemGroups[nGroup] = [];
                        nGroup++;

                    break;

                }
            
            }

        }
        while((oNode = oNode.nextSibling));


        /*
            Apply the "first-of-type" class to the first UL to mimic 
            the "first-of-type" CSS3 psuedo class.
        */

        if(this._aListElements[0]) {

            Dom.addClass(this._aListElements[0], "first-of-type");

        }

    }


    oNode = null;

    this.logger.log("Searching DOM for items to initialize.");

    if(this.srcElement.tagName) {
    
        switch(this.srcElement.tagName.toUpperCase()) {
    
            case "DIV":
    
                if(this._aListElements.length > 0) {
    
                    this.logger.log("Found " + 
                        this._aListElements.length + 
                        " item groups to initialize.");
    
                    var i = this._aListElements.length - 1;
    
                    do {
    
                        oNode = this._aListElements[i].firstChild;
        
                        this.logger.log("Scanning " + 
                            this._aListElements[i].childNodes.length + 
                            " child nodes for items to initialize.");
    
                        do {
        
                            if(oNode && oNode.tagName) {
                            
                                switch(oNode.tagName.toUpperCase()) {
                
                                    case "LI":
        
                                        this.logger.log("Initializing " + 
                                            oNode.tagName + " node.");
        
                                        this.addItem(
                                                new this.ITEM_TYPE(
                                                    oNode, 
                                                    { parent: this }
                                                ), 
                                                i
                                            );
                
                                    break;
                
                                }
    
                            }
                
                        }
                        while((oNode = oNode.nextSibling));
                
                    }
                    while(i--);
    
                }
    
            break;
    
            case "SELECT":
    
                this.logger.log("Scanning " +  
                    this.srcElement.childNodes.length + 
                    " child nodes for items to initialize.");
    
                oNode = this.srcElement.firstChild;
    
                do {
    
                    if(oNode && oNode.tagName) {
                    
                        switch(oNode.tagName.toUpperCase()) {
        
                            case "OPTGROUP":
                            case "OPTION":
        
                                this.logger.log("Initializing " +  
                                    oNode.tagName + " node.");
        
                                this.addItem(
                                        new this.ITEM_TYPE(
                                                oNode, 
                                                { parent: this }
                                            )
                                        );
        
                            break;
        
                        }

                    }
    
                }
                while((oNode = oNode.nextSibling));
    
            break;
    
        }

    }

},


/**
* @method _getFirstEnabledItem
* @description Returns the first enabled item in the menu.
* @return {YAHOO.widget.MenuItem}
* @private
*/
_getFirstEnabledItem: function() {

    var nGroups = this._aItemGroups.length;
    var oItem;
    var aItemGroup;

    for(var i=0; i<nGroups; i++) {

        aItemGroup = this._aItemGroups[i];
        
        if(aItemGroup) {

            var nItems = aItemGroup.length;
            
            for(var n=0; n<nItems; n++) {
            
                oItem = aItemGroup[n];
                
                if(
                    !oItem.cfg.getProperty("disabled") && 
                    oItem.element.style.display != "none"
                ) {
                
                    return oItem;
                
                }
    
                oItem = null;
    
            }
        
        }
    
    }
    
},


/**
* @method _checkPosition
* @description Checks to make sure that the value of the "position" property is one of the supported strings. Returns true if the position is supported.
* @private
* @param {Object} p_sPosition String specifying the position of the menu.
* @return {Boolean}
*/
_checkPosition: function(p_sPosition) {

    if(typeof p_sPosition == "string") {

        var sPosition = p_sPosition.toLowerCase();

        return ("dynamic,static".indexOf(sPosition) != -1);

    }

},


/**
* @method _addItemToGroup
* @description Adds a menu item to a group.
* @private
* @param {Number} p_nGroupIndex Number indicating the group to which the item belongs.
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance to be added to the menu.
* @param {String} p_oItem String specifying the text of the item to be added to the menu.
* @param {Object} p_oItem Object literal containing a set of menu item configuration properties.
* @param {Number} p_nItemIndex Optional. Number indicating the index at which the menu item should be added.
* @return {YAHOO.widget.MenuItem}
*/
_addItemToGroup: function(p_nGroupIndex, p_oItem, p_nItemIndex) {

    var oItem;

    if(p_oItem instanceof this.ITEM_TYPE) {

        oItem = p_oItem;
        oItem.parent = this;

    }
    else if(typeof p_oItem == "string") {

        oItem = new this.ITEM_TYPE(p_oItem, { parent: this });
    
    }
    else if(typeof p_oItem == "object" && p_oItem.text) {

        var sText = p_oItem.text;

        delete p_oItem["text"];

        p_oItem.parent = this;

        oItem = new this.ITEM_TYPE(sText, p_oItem);

    }


    if(oItem) {

        var nGroupIndex = typeof p_nGroupIndex == "number" ? p_nGroupIndex : 0;
        
        var aGroup = this._getItemGroup(nGroupIndex);
        
        var oGroupItem;


        if(!aGroup) {

            aGroup = this._createItemGroup(nGroupIndex);

        }


        if(typeof p_nItemIndex == "number") {

            var bAppend = (p_nItemIndex >= aGroup.length);            


            if(aGroup[p_nItemIndex]) {
    
                aGroup.splice(p_nItemIndex, 0, oItem);
    
            }
            else {
    
                aGroup[p_nItemIndex] = oItem;
    
            }


            oGroupItem = aGroup[p_nItemIndex];

            if(oGroupItem) {

                if(
                    bAppend && 
                    (
                        !oGroupItem.element.parentNode || 
                        oGroupItem.element.parentNode.nodeType == 11
                    )
                ) {
        
                    this._aListElements[nGroupIndex].appendChild(
                        oGroupItem.element
                    );
    
                }
                else {
  
    
                    /**
                    * Returns the next sibling of an item in an array.
                    * @private
                    * @param {p_aArray} Array to search.
                    * @param {p_nStartIndex} Number indicating the index to 
                    * start searching the array.
                    * @return {Object}
                    */
                    var getNextItemSibling = 
                    
                        function(p_aArray, p_nStartIndex) {
                
                            return (
                                    p_aArray[p_nStartIndex] || 
                                    getNextItemSibling(
                                        p_aArray, 
                                        (p_nStartIndex+1)
                                    )
                                );
                
                        };
    
    
                    var oNextItemSibling = 
                            getNextItemSibling(aGroup, (p_nItemIndex+1));
    
                    if(
                        oNextItemSibling && 
                        (
                            !oGroupItem.element.parentNode || 
                            oGroupItem.element.parentNode.nodeType == 11
                        )
                    ) {
            
                        this._aListElements[nGroupIndex].insertBefore(
                                oGroupItem.element, 
                                oNextItemSibling.element
                            );
        
                    }
    
                }
    

                oGroupItem.parent = this;
        
                this._subscribeToItemEvents(oGroupItem);
    
                this._configureSubmenu(oGroupItem);
                
                this._updateItemProperties(nGroupIndex);
        
                this.logger.log("Item inserted." + 
                    " Text: " + oGroupItem.cfg.getProperty("text") + ", " + 
                    " Index: " + oGroupItem.index + ", " + 
                    " Group Index: " + oGroupItem.groupIndex);

                this.itemAddedEvent.fire(oGroupItem);

                return oGroupItem;
    
            }

        }
        else {
    
            var nItemIndex = aGroup.length;
    
            aGroup[nItemIndex] = oItem;

            oGroupItem = aGroup[nItemIndex];
    

            if(oGroupItem) {
    
                if(
                    !Dom.isAncestor(
                        this._aListElements[nGroupIndex], 
                        oGroupItem.element
                    )
                ) {
    
                    this._aListElements[nGroupIndex].appendChild(
                        oGroupItem.element
                    );
    
                }
    
                oGroupItem.element.setAttribute("groupindex", nGroupIndex);
                oGroupItem.element.setAttribute("index", nItemIndex);
        
                oGroupItem.parent = this;
    
                oGroupItem.index = nItemIndex;
                oGroupItem.groupIndex = nGroupIndex;
        
                this._subscribeToItemEvents(oGroupItem);
    
                this._configureSubmenu(oGroupItem);
    
                if(nItemIndex === 0) {
        
                    Dom.addClass(oGroupItem.element, "first-of-type");
        
                }

                this.logger.log("Item added." + 
                    " Text: " + oGroupItem.cfg.getProperty("text") + ", " + 
                    " Index: " + oGroupItem.index + ", " + 
                    " Group Index: " + oGroupItem.groupIndex);
        

                this.itemAddedEvent.fire(oGroupItem);

                return oGroupItem;
    
            }
    
        }

    }
    
},


/**
* @method _removeItemFromGroupByIndex
* @description Removes a menu item from a group by index.  Returns the menu item that was removed.
* @private
* @param {Number} p_nGroupIndex Number indicating the group to which the menu item belongs.
* @param {Number} p_nItemIndex Number indicating the index of the menu item to be removed.
* @return {YAHOO.widget.MenuItem}
*/    
_removeItemFromGroupByIndex: function(p_nGroupIndex, p_nItemIndex) {

    var nGroupIndex = typeof p_nGroupIndex == "number" ? p_nGroupIndex : 0;
    var aGroup = this._getItemGroup(nGroupIndex);

    if(aGroup) {

        var aArray = aGroup.splice(p_nItemIndex, 1);
        var oItem = aArray[0];
    
        if(oItem) {
    
            // Update the index and className properties of each member        
            
            this._updateItemProperties(nGroupIndex);
    
            if(aGroup.length === 0) {
    
                // Remove the UL
    
                var oUL = this._aListElements[nGroupIndex];
    
                if(this.body && oUL) {
    
                    this.body.removeChild(oUL);
    
                }
    
                // Remove the group from the array of items
    
                this._aItemGroups.splice(nGroupIndex, 1);
    
    
                // Remove the UL from the array of ULs
    
                this._aListElements.splice(nGroupIndex, 1);
    
    
                /*
                     Assign the "first-of-type" class to the new first UL 
                     in the collection
                */
    
                oUL = this._aListElements[0];
    
                if(oUL) {
    
                    Dom.addClass(oUL, "first-of-type");
    
                }            
    
            }
    

            this.itemRemovedEvent.fire(oItem);    


            // Return a reference to the item that was removed
        
            return oItem;
    
        }

    }
    
},


/**
* @method _removeItemFromGroupByValue
* @description Removes a menu item from a group by reference.  Returns the menu item that was removed.
* @private
* @param {Number} p_nGroupIndex Number indicating the group to which the menu item belongs.
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance to be removed.
* @return {YAHOO.widget.MenuItem}
*/    
_removeItemFromGroupByValue: function(p_nGroupIndex, p_oItem) {

    var aGroup = this._getItemGroup(p_nGroupIndex);

    if(aGroup) {

        var nItems = aGroup.length;
        var nItemIndex = -1;
    
        if(nItems > 0) {
    
            var i = nItems-1;
        
            do {
        
                if(aGroup[i] == p_oItem) {
        
                    nItemIndex = i;
                    break;    
        
                }
        
            }
            while(i--);
        
            if(nItemIndex > -1) {
        
                return this._removeItemFromGroupByIndex(
                            p_nGroupIndex, 
                            nItemIndex
                        );
        
            }
    
        }
    
    }

},


/**
* @method _updateItemProperties
* @description Updates the "index," "groupindex," and "className" properties of the menu items in the specified group. 
* @private
* @param {Number} p_nGroupIndex Number indicating the group of items to update.
*/
_updateItemProperties: function(p_nGroupIndex) {

    var aGroup = this._getItemGroup(p_nGroupIndex);
    var nItems = aGroup.length;

    if(nItems > 0) {

        var i = nItems - 1;
        var oItem;
        var oLI;

        // Update the index and className properties of each member
    
        do {

            oItem = aGroup[i];

            if(oItem) {
    
                oLI = oItem.element;

                oItem.index = i;
                oItem.groupIndex = p_nGroupIndex;

                oLI.setAttribute("groupindex", p_nGroupIndex);
                oLI.setAttribute("index", i);

                Dom.removeClass(oLI, "first-of-type");

            }
    
        }
        while(i--);


        if(oLI) {

            Dom.addClass(oLI, "first-of-type");

        }

    }

},


/**
* @method _createItemGroup
* @description Creates a new menu item group (array) and its associated <code>&#60;ul&#62;</code> element. Returns an aray of menu item groups.
* @private
* @param {Number} p_nIndex Number indicating the group to create.
* @return {Array}
*/
_createItemGroup: function(p_nIndex) {

    if(!this._aItemGroups[p_nIndex]) {

        this._aItemGroups[p_nIndex] = [];

        var oUL = document.createElement("ul");

        this._aListElements[p_nIndex] = oUL;

        return this._aItemGroups[p_nIndex];

    }

},


/**
* @method _getItemGroup
* @description Returns the menu item group at the specified index.
* @private
* @param {Number} p_nIndex Number indicating the index of the menu item group to be retrieved.
* @return {Array}
*/
_getItemGroup: function(p_nIndex) {

    var nIndex = ((typeof p_nIndex == "number") ? p_nIndex : 0);

    return this._aItemGroups[nIndex];

},


/**
* @method _configureSubmenu
* @description Subscribe's the menu item's submenu to its parent menu's events.
* @private
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance with the submenu to be configured.
*/
_configureSubmenu: function(p_oItem) {

    var oSubmenu = p_oItem.cfg.getProperty("submenu");

    if(oSubmenu) {
            
        /*
            Listen for configuration changes to the parent menu 
            so they they can be applied to the submenu.
        */

        this.cfg.configChangedEvent.subscribe(
                this._onParentMenuConfigChange, 
                oSubmenu, 
                true
            );

        this.renderEvent.subscribe(
                this._onParentMenuRender,
                oSubmenu, 
                true
            );

        oSubmenu.beforeShowEvent.subscribe(
                this._onSubmenuBeforeShow, 
                oSubmenu, 
                true
            );

        oSubmenu.showEvent.subscribe(
                this._onSubmenuShow, 
                oSubmenu, 
                true
            );

        oSubmenu.hideEvent.subscribe(
                this._onSubmenuHide, 
                oSubmenu, 
                true
            );

    }

},


/**
* @method _subscribeToItemEvents
* @description Subscribes a menu to a menu item's event.
* @private
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance whose events should be subscribed to.
*/
_subscribeToItemEvents: function(p_oItem) {

    p_oItem.focusEvent.subscribe(this._onMenuItemFocus, p_oItem, this);

    p_oItem.blurEvent.subscribe(this._onMenuItemBlur, this, true);

    p_oItem.cfg.configChangedEvent.subscribe(
        this._onMenuItemConfigChange,
        p_oItem,
        this
    );

},


/**
* @method _getOffsetWidth
* @description Returns the offset width of the menu's <code>&#60;div&#62;</code> element.
* @private
*/
_getOffsetWidth: function() {

    var oClone = this.element.cloneNode(true);

    Dom.setStyle(oClone, "width", "");

    document.body.appendChild(oClone);

    var sWidth = oClone.offsetWidth;

    document.body.removeChild(oClone);

    return sWidth;

},


/**
* @method _cancelHideDelay
* @description Cancels the call to "hideMenu."
* @private
*/
_cancelHideDelay: function() {

    var oRoot = this.getRoot();

    if(oRoot._nHideDelayId) {

        window.clearTimeout(oRoot._nHideDelayId);

    }

},


/**
* @method _execHideDelay
* @description Hides the menu after the number of milliseconds specified by the "hidedelay" configuration property.
* @private
*/
_execHideDelay: function() {

    this._cancelHideDelay();

    var oRoot = this.getRoot();
    var me = this;

    var hideMenu = function() {
    
        if(oRoot.activeItem) {

            oRoot.clearActiveItem();

        }

        if(oRoot == me && me.cfg.getProperty("position") == "dynamic") {

            me.hide();            
        
        }
    
    };


    oRoot._nHideDelayId = 
        window.setTimeout(hideMenu, oRoot.cfg.getProperty("hidedelay"));

},


/**
* @method _cancelShowDelay
* @description Cancels the call to the "showMenu."
* @private
*/
_cancelShowDelay: function() {

    var oRoot = this.getRoot();

    if(oRoot._nShowDelayId) {

        window.clearTimeout(oRoot._nShowDelayId);

    }

},


/**
* @method _execShowDelay
* @description Shows the menu after the number of milliseconds specified by the "showdelay" configuration property have ellapsed.
* @private
* @param {YAHOO.widget.Menu} p_oMenu Object specifying the menu that should be made visible.
*/
_execShowDelay: function(p_oMenu) {

    this._cancelShowDelay();

    var oRoot = this.getRoot();

    var showMenu = function() {

        p_oMenu.show();    
    
    };


    oRoot._nShowDelayId = 
        window.setTimeout(showMenu, oRoot.cfg.getProperty("showdelay"));

},



// Protected methods


/**
* @method _onMouseOver
* @description "mouseover" event handler for the menu.
* @protected
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onMouseOver: function(p_sType, p_aArgs, p_oMenu) {

    var oEvent = p_aArgs[0];
    var oItem = p_aArgs[1];
    var oTarget = Event.getTarget(oEvent);

    if(
        !this._bHandledMouseOverEvent && 
        (oTarget == this.element || Dom.isAncestor(this.element, oTarget))
    ) {
    
        // MENU  MOUSEOVER LOGIC HERE

        this.clearActiveItem();

        this._bHandledMouseOverEvent = true;
        this._bHandledMouseOutEvent = false;
    
    }


    if(
        oItem && !oItem.handledMouseOverEvent && 
        (oTarget == oItem.element || Dom.isAncestor(oItem.element, oTarget))
    ) {

        var oItemCfg = oItem.cfg;
    
        // Select and focus the current menu item
    
        oItemCfg.setProperty("selected", true);
        oItem.focus();


        if(this.cfg.getProperty("autosubmenudisplay")) {

            // Show the submenu this menu item

            var oSubmenu = oItemCfg.getProperty("submenu");
        
            if(oSubmenu) {
        
                if(this.cfg.getProperty("showdelay") > 0) {

                    this._execShowDelay(oSubmenu);
        
                }
                else {

                    oSubmenu.show();

                }
        
            }

        }                        

        oItem.handledMouseOverEvent = true;
        oItem.handledMouseOutEvent = false;

    }

},


/**
* @method _onMouseOut
* @description "mouseout" event handler for the menu.
* @protected
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onMouseOut: function(p_sType, p_aArgs, p_oMenu) {
    
    var oEvent = p_aArgs[0];
    var oItem = p_aArgs[1];
    var oRelatedTarget = Event.getRelatedTarget(oEvent);
    var bMovingToSubmenu = false;

    if(oItem) {

        var oItemCfg = oItem.cfg;
        var oSubmenu = oItemCfg.getProperty("submenu");


        if(
            oSubmenu && 
            (
                oRelatedTarget == oSubmenu.element ||
                Dom.isAncestor(oSubmenu.element, oRelatedTarget)
            )
        ) {

            bMovingToSubmenu = true;

        }


        if( 
            !oItem.handledMouseOutEvent && 
            (
                (
                    oRelatedTarget != oItem.element &&  
                    !Dom.isAncestor(oItem.element, oRelatedTarget)
                ) || bMovingToSubmenu
            )
        ) {


            if(this.cfg.getProperty("showdelay") > 0) {
            
                this._cancelShowDelay();
            
            }


            if(!bMovingToSubmenu) {

                oItemCfg.setProperty("selected", false);
            
            }


            if(this.cfg.getProperty("autosubmenudisplay")) {
            
                if(oSubmenu) {
            
                    if(
                        !(
                            oRelatedTarget == oSubmenu.element || 
                            YAHOO.util.Dom.isAncestor(
                                oSubmenu.element, 
                                oRelatedTarget
                            )
                        )
                    ) {

                        oSubmenu.hide();
            
                    }
            
                }
            
            }

            oItem.handledMouseOutEvent = true;
            oItem.handledMouseOverEvent = false;
    
        }

    }


    if(
        !this._bHandledMouseOutEvent && 
        (
            (
                oRelatedTarget != this.element &&  
                !Dom.isAncestor(this.element, oRelatedTarget)
            ) 
            || bMovingToSubmenu
        )
    ) {
        
        this._bHandledMouseOutEvent = true;
        this._bHandledMouseOverEvent = false;

    }

},


/**
* @method _onClick
* @description "click" event handler for the menu.
* @protected
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onClick: function(p_sType, p_aArgs, p_oMenu) {

    var oEvent = p_aArgs[0];
    var oItem = p_aArgs[1];
    var oTarget = Event.getTarget(oEvent);

    if(oItem) {

        var oItemCfg = oItem.cfg;
        var oSubmenu = oItemCfg.getProperty("submenu");


        /*
            ACCESSIBILITY FEATURE FOR SCREEN READERS: 
            Expand/collapse the submenu when the user clicks 
            on the submenu indicator image.
        */        

        if(oTarget == oItem.submenuIndicator && oSubmenu) {

            if(oSubmenu.cfg.getProperty("visible")) {

                oSubmenu.hide();
    
            }
            else {

                this.clearActiveItem();

                this.activeItem = oItem;

                oItem.cfg.setProperty("selected", true);

                oSubmenu.show();
    
            }
    
        }
        else {

            var sURL = oItemCfg.getProperty("url");
            var bCurrentPageURL = (sURL.substr((sURL.length-1),1) == "#");
            var sTarget = oItemCfg.getProperty("target");
            var bHasTarget = (sTarget && sTarget.length > 0);

            /*
                Prevent the browser from following links 
                equal to "#"
            */
            
            if(
                oTarget.tagName.toUpperCase() == "A" && 
                bCurrentPageURL && !bHasTarget
            ) {

                Event.preventDefault(oEvent);
            
            }

            if(
                oTarget.tagName.toUpperCase() != "A" && 
                !bCurrentPageURL && !bHasTarget
            ) {
                
                /*
                    Follow the URL of the item regardless of 
                    whether or not the user clicked specifically
                    on the anchor element.
                */
    
                document.location = sURL;
        
            }


            /*
                If the item doesn't navigate to a URL and it doesn't have
                a submenu, then collapse the menu tree.
            */

            if(bCurrentPageURL && !oSubmenu) {
    
                var oRoot = this.getRoot();
                
                if(oRoot.cfg.getProperty("position") == "static") {
    
                    oRoot.clearActiveItem();
    
                }
                else {
    
                    oRoot.hide();
                
                }
    
            }

        }                    
    
    }

},


/**
* @method _onKeyDown
* @description "keydown" event handler for the menu.
* @protected
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onKeyDown: function(p_sType, p_aArgs, p_oMenu) {

    var oEvent = p_aArgs[0];
    var oItem = p_aArgs[1];
    var oSubmenu;

    if(oItem) {

        var oItemCfg = oItem.cfg;
        var oParentItem = this.parent;
        var oRoot;
        var oNextItem;


        switch(oEvent.keyCode) {
    
            case 38:    // Up arrow
            case 40:    // Down arrow
    
                if(
                    oItem == this.activeItem && 
                    !oItemCfg.getProperty("selected")
                ) {
    
                    oItemCfg.setProperty("selected", true);
    
                }
                else {
    
                    oNextItem = (oEvent.keyCode == 38) ? 
                        oItem.getPreviousEnabledSibling() : 
                        oItem.getNextEnabledSibling();
            
                    if(oNextItem) {
    
                        this.clearActiveItem();
    
                        oNextItem.cfg.setProperty("selected", true);
                        oNextItem.focus();

                    }
    
                }
    
                Event.preventDefault(oEvent);
    
            break;
            
    
            case 39:    // Right arrow
    
                oSubmenu = oItemCfg.getProperty("submenu");
    
                if(oSubmenu) {
    
                    if(!oItemCfg.getProperty("selected")) {
        
                        oItemCfg.setProperty("selected", true);
        
                    }
    
                    oSubmenu.show();
    
                    oSubmenu.setInitialSelection();
    
                }
                else {
    
                    oRoot = this.getRoot();
                    
                    if(oRoot instanceof YAHOO.widget.MenuBar) {
    
                        oNextItem = oRoot.activeItem.getNextEnabledSibling();
    
                        if(oNextItem) {
                        
                            oRoot.clearActiveItem();
    
                            oNextItem.cfg.setProperty("selected", true);
    
                            oSubmenu = oNextItem.cfg.getProperty("submenu");
    
                            if(oSubmenu) {
    
                                oSubmenu.show();
                            
                            }
    
                            oNextItem.focus();
                        
                        }
                    
                    }
                
                }
    
    
                Event.preventDefault(oEvent);
    
            break;
    
    
            case 37:    // Left arrow
    
                if(oParentItem) {
    
                    var oParentMenu = oParentItem.parent;
    
                    if(oParentMenu instanceof YAHOO.widget.MenuBar) {
    
                        oNextItem = 
                            oParentMenu.activeItem.getPreviousEnabledSibling();
    
                        if(oNextItem) {
                        
                            oParentMenu.clearActiveItem();
    
                            oNextItem.cfg.setProperty("selected", true);
    
                            oSubmenu = oNextItem.cfg.getProperty("submenu");
    
                            if(oSubmenu) {
                            
                                oSubmenu.show();
                            
                            }
    
                            oNextItem.focus();
                        
                        } 
                    
                    }
                    else {
    
                        this.hide();
    
                        oParentItem.focus();
                    
                    }
    
                }
    
                Event.preventDefault(oEvent);
    
            break;        
    
        }


    }
    else if(oEvent.keyCode == 27) { // Esc key

        if(this.cfg.getProperty("position") == "dynamic") {
        
            this.hide();

            if(this.parent) {

                this.parent.focus();
            
            }

        }
        else if(this.activeItem) {

            oSubmenu = this.activeItem.cfg.getProperty("submenu");

            if(oSubmenu && oSubmenu.cfg.getProperty("visible")) {
            
                oSubmenu.hide();
                this.activeItem.focus();
            
            }
            else {

                this.activeItem.cfg.setProperty("selected", false);
                this.activeItem.blur();
        
            }
        
        }


        Event.preventDefault(oEvent);
    
    }
    
},



// Private methods


/**
* @method _onInit
* @description "init" event handler for the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onInit: function(p_sType, p_aArgs, p_oMenu) {

    if(
        (
            (this.parent && !this.lazyLoad) || 
            (!this.parent && this.cfg.getProperty("position") == "static") ||
            (
                !this.parent && 
                !this.lazyLoad && 
                this.cfg.getProperty("position") == "dynamic"
            ) 
        ) && 
        this.getItemGroups().length === 0
    ) {
 
        if(this.srcElement) {

            this._initSubTree();
        
        }


        if(this.itemData) {

            this.addItems(this.itemData);

        }
    
    }
    else if(this.lazyLoad) {

        this.cfg.fireQueue();
    
    }

},


/**
* @method _onBeforeRender
* @description "beforerender" event handler for the menu.  Appends all of the <code>&#60;ul&#62;</code>, <code>&#60;li&#62;</code> and their accompanying title elements to the body element of the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onBeforeRender: function(p_sType, p_aArgs, p_oMenu) {

    var oConfig = this.cfg;
    var oEl = this.element;
    var nListElements = this._aListElements.length;


    if(nListElements > 0) {

        var i = 0;
        var bFirstList = true;
        var oUL;
        var oGroupTitle;


        do {

            oUL = this._aListElements[i];

            if(oUL) {

                if(bFirstList) {
        
                    Dom.addClass(oUL, "first-of-type");
                    bFirstList = false;
        
                }


                if(!Dom.isAncestor(oEl, oUL)) {

                    this.appendToBody(oUL);

                }


                oGroupTitle = this._aGroupTitleElements[i];

                if(oGroupTitle) {

                    if(!Dom.isAncestor(oEl, oGroupTitle)) {

                        oUL.parentNode.insertBefore(oGroupTitle, oUL);

                    }


                    Dom.addClass(oUL, "hastitle");

                }

            }

            i++;

        }
        while(i < nListElements);

    }

},


/**
* @method _onRender
* @description "render" event handler for the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onRender: function(p_sType, p_aArgs, p_oMenu) {

    if(this.cfg.getProperty("position") == "dynamic") {

        var sWidth = 
            this.element.parentNode.tagName.toUpperCase() == "BODY" ? 
            this.element.offsetWidth : this._getOffsetWidth();
    
        this.cfg.setProperty("width", (sWidth + "px"));

    }

},


/**
* @method _onBeforeShow
* @description "beforeshow" event handler for the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onBeforeShow: function(p_sType, p_aArgs, p_oMenu) {
    
    if(this.lazyLoad && this.getItemGroups().length === 0) {

        if(this.srcElement) {
        
            this._initSubTree();

        }


        if(this.itemData) {

            if(
                this.parent && this.parent.parent && 
                this.parent.parent.srcElement && 
                this.parent.parent.srcElement.tagName.toUpperCase() == "SELECT"
            ) {

                var nOptions = this.itemData.length;
    
                for(var n=0; n<nOptions; n++) {

                    if(this.itemData[n].tagName) {

                        this.addItem((new this.ITEM_TYPE(this.itemData[n])));
    
                    }
    
                }
            
            }
            else {

                this.addItems(this.itemData);
            
            }
        
        }


        if(this.srcElement) {

            this.render();

        }
        else {

            if(this.parent) {

                this.render(this.parent.element);            

            }
            else {

                this.render(this.cfg.getProperty("container"));
                
            }                

        }

    }
    
},


/**
* @method _onShow
* @description "show" event handler for the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onShow: function(p_sType, p_aArgs, p_oMenu) {

    this.setInitialFocus();
    
    var oParent = this.parent;
    
    if(oParent) {


        var oParentMenu = oParent.parent;

        var aParentAlignment = oParentMenu.cfg.getProperty("submenualignment");
        var aAlignment = this.cfg.getProperty("submenualignment");

        if(
            (aParentAlignment[0] != aAlignment[0]) &&
            (aParentAlignment[1] != aAlignment[1])
        ) {

            this.cfg.setProperty(
                "submenualignment", 
                [ aParentAlignment[0], aParentAlignment[1] ]
            );
        
        }


        if(
            !oParentMenu.cfg.getProperty("autosubmenudisplay") && 
            oParentMenu.cfg.getProperty("position") == "static"
        ) {

            oParentMenu.cfg.setProperty("autosubmenudisplay", true);


            /**
            * "click" event handler for the document
            * @private
            * @param {Event} p_oEvent Object reference for the DOM event object 
            * passed back by the event utility (YAHOO.util.Event).
            */
            var disableAutoSubmenuDisplay = function(p_oEvent) {

                if(
                    p_oEvent.type == "mousedown" || 
                    (p_oEvent.type == "keydown" && p_oEvent.keyCode == 27)
                ) {

                    /*  
                        Set the "autosubmenudisplay" to "false" if the user
                        clicks outside the menu bar.
                    */

                    var oTarget = Event.getTarget(p_oEvent);

                    if(
                        oTarget != oParentMenu.element || 
                        !YAHOO.util.Dom.isAncestor(oParentMenu.element, oTarget)
                    ) {

                        oParentMenu.cfg.setProperty(
                            "autosubmenudisplay", 
                            false
                        );

                        Event.removeListener(
                                document, 
                                "mousedown", 
                                disableAutoSubmenuDisplay
                            );

                        Event.removeListener(
                                document, 
                                "keydown", 
                                disableAutoSubmenuDisplay
                            );

                    }
                
                }

            };

            Event.addListener(document, "mousedown", disableAutoSubmenuDisplay);                             
            Event.addListener(document, "keydown", disableAutoSubmenuDisplay);

        }

    }

},


/**
* @method _onBeforeHide
* @description "beforehide" event handler for the menu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
_onBeforeHide: function(p_sType, p_aArgs, p_oMenu) {

    this.clearActiveItem(true);

},


/**
* @method _onParentMenuConfigChange
* @description "configchange" event handler for a submenu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oSubmenu Object representing the submenu that subscribed to the event.
*/
_onParentMenuConfigChange: function(p_sType, p_aArgs, p_oSubmenu) {
    
    var sPropertyName = p_aArgs[0][0];
    var oPropertyValue = p_aArgs[0][1];

    switch(sPropertyName) {

        case "iframe":
        case "constraintoviewport":
        case "hidedelay":
        case "showdelay":
        case "clicktohide":
        case "effect":

            p_oSubmenu.cfg.setProperty(sPropertyName, oPropertyValue);
                
        break;        
        
    }
    
},


/**
* @method _onParentMenuRender
* @description "render" event handler for a submenu.  Renders a  
* submenu in response to the firing of its parent's "render" event.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oSubmenu Object representing the submenu that subscribed to the event.
*/
_onParentMenuRender: function(p_sType, p_aArgs, p_oSubmenu) {

    /*
        Set the "constraintoviewport" configuration 
        property to match the parent Menu
    */ 

    var oParentMenu = p_oSubmenu.parent.parent;

    var oConfig = {

            constraintoviewport: 
                oParentMenu.cfg.getProperty("constraintoviewport"),

            xy: [0,0],
                
            clicktohide:
                oParentMenu.cfg.getProperty("clicktohide"),
                
            effect:
                oParentMenu.cfg.getProperty("effect")                

        };


    var nShowDelay = oParentMenu.cfg.getProperty("showdelay");

    if(nShowDelay > 0) {

        oConfig.showdelay = nShowDelay;

    }


    var nHideDelay = oParentMenu.cfg.getProperty("hidedelay");

    if(nHideDelay > 0) {

        oConfig.hidedelay = nHideDelay;

    }


    /*
        Only sync the "iframe" configuration property if the parent
        menu's "position" configuration is the same.
    */

    if(
        this.cfg.getProperty("position") == 
        oParentMenu.cfg.getProperty("position")
    ) {

        oConfig.iframe = oParentMenu.cfg.getProperty("iframe");
    
    }
               

    p_oSubmenu.cfg.applyConfig(oConfig);


    if(!this.lazyLoad) {

        if(Dom.inDocument(this.element)) {
    
            this.render();
    
        }
        else {

            this.render(this.parent.element);
    
        }

    }
    
},


/**
* @method _onSubmenuBeforeShow
* @description "beforeshow" event handler for a submenu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oSubmenu Object representing the submenu that subscribed to the event.
*/
_onSubmenuBeforeShow: function(p_sType, p_aArgs, p_oSubmenu) {
    
    var oParent = this.parent;
    var aAlignment = oParent.parent.cfg.getProperty("submenualignment");

    this.cfg.setProperty(
        "context", 
        [oParent.element, aAlignment[0], aAlignment[1]]
    );

    oParent.submenuIndicator.alt = oParent.EXPANDED_SUBMENU_INDICATOR_ALT_TEXT;
    
},


/**
* @method _onSubmenuShow
* @description "show" event handler for a submenu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oSubmenu Object representing the submenu that subscribed to the event.
*/
_onSubmenuShow: function(p_sType, p_aArgs, p_oSubmenu) {
    
    var oParent = this.parent;

    oParent.submenuIndicator.alt = oParent.EXPANDED_SUBMENU_INDICATOR_ALT_TEXT;

},


/**
* @method _onSubmenuHide
* @description "hide" Custom Event handler for a submenu.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oSubmenu Object representing the submenu that subscribed to the event.
*/
_onSubmenuHide: function(p_sType, p_aArgs, p_oSubmenu) {
    
    var oParent = this.parent;

    oParent.submenuIndicator.alt = oParent.COLLAPSED_SUBMENU_INDICATOR_ALT_TEXT;

},


/**
* @method _onMenuItemFocus
* @description "focus" event handler for the menu's items.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.MenuItem} p_oItem Object representing the menu item that fired the event.
*/
_onMenuItemFocus: function(p_sType, p_aArgs, p_oItem) {

    this.activeItem = p_oItem;

},


/**
* @method _onMenuItemBlur
* @description "blur" event handler for the menu's items.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
*/
_onMenuItemBlur: function(p_sType, p_aArgs) {

    this.activeItem = null;

},


/**
* @method _onMenuItemConfigChange
* @description "configchange" event handler for the menu's items.
* @private
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.MenuItem} p_oItem Object representing the menu item that fired the event.
*/
_onMenuItemConfigChange: function(p_sType, p_aArgs, p_oItem) {

    var sProperty = p_aArgs[0][0];

    switch(sProperty) {

        case "submenu":

            var oSubmenu = p_aArgs[0][1];

            if(oSubmenu) {

                this._configureSubmenu(p_oItem);

            }

        break;

        case "text":
        case "helptext":

            /*
                A change to an item's "text" or "helptext"
                configuration properties requires the width of the parent
                menu to be recalculated.
            */

            if(this.element.style.width) {
    
                var sWidth = this._getOffsetWidth() + "px";

                Dom.setStyle(this.element, "width", sWidth);

            }

        break;

    }

},



// Public event handlers for configuration properties


/**
* @method enforceConstraints
* @description The default event handler executed when the moveEvent is fired,  
* if the "constraintoviewport" configuration property is set to true.
* @param {String} type The name of the event that was fired.
* @param {Array} args Collection of arguments sent when the 
* event was fired.
* @param {Array} obj Array containing the current Menu instance 
* and the item that fired the event.
*/
enforceConstraints: function(type, args, obj) {

    var oConfig = this.cfg;

    var pos = args[0];
        
    var x = pos[0];
    var y = pos[1];
    
    var bod = document.getElementsByTagName('body')[0];
    var htm = document.getElementsByTagName('html')[0];
    
    var bodyOverflow = Dom.getStyle(bod, "overflow");
    var htmOverflow = Dom.getStyle(htm, "overflow");
    
    var offsetHeight = this.element.offsetHeight;
    var offsetWidth = this.element.offsetWidth;
    
    var viewPortWidth = Dom.getClientWidth();
    var viewPortHeight = Dom.getClientHeight();
    
    var scrollX = window.scrollX || document.body.scrollLeft;
    var scrollY = window.scrollY || document.body.scrollTop;
    
    var topConstraint = scrollY + 10;
    var leftConstraint = scrollX + 10;
    var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
    var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;
    
    var aContext = oConfig.getProperty("context");
    var oContextElement = aContext ? aContext[0] : null;
    
    
    if (x < 10) {

        x = leftConstraint;

    } else if ((x + offsetWidth) > viewPortWidth) {

        if(
            oContextElement && 
            ((x - oContextElement.offsetWidth) > offsetWidth)
        ) {

            x = (x - (oContextElement.offsetWidth + offsetWidth));

        }
        else {

            x = rightConstraint;

        }

    }

    if (y < 10) {

        y = topConstraint;

    } else if (y > bottomConstraint) {

        if(oContextElement && (y > offsetHeight)) {

            y = ((y + oContextElement.offsetHeight) - offsetHeight);

        }
        else {

            y = bottomConstraint;

        }

    }

    oConfig.setProperty("x", x, true);
    oConfig.setProperty("y", y, true);

},


/**
* @method configVisible
* @description Event handler for when the "visible" configuration property the menu changes.
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
configVisible: function(p_sType, p_aArgs, p_oMenu) {

    if(this.cfg.getProperty("position") == "dynamic") {

        YAHOO.widget.Menu.superclass.configVisible.call(
            this, 
            p_sType, 
            p_aArgs, 
            p_oMenu
        );

    }
    else {

        var bVisible = p_aArgs[0];
    	var sDisplay = Dom.getStyle(this.element, "display");

        if(bVisible) {

            if(sDisplay != "block") {
                this.beforeShowEvent.fire();
                Dom.setStyle(this.element, "display", "block");
                this.showEvent.fire();
            }
        
        }
        else {

			if(sDisplay == "block") {
				this.beforeHideEvent.fire();
				Dom.setStyle(this.element, "display", "none");
				this.hideEvent.fire();
			}
        
        }

    }

},


/**
* @method configPosition
* @description Event handler for when the "position" configuration property of the menu changes.
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
configPosition: function(p_sType, p_aArgs, p_oMenu) {

    var sCSSPosition = p_aArgs[0] == "static" ? "static" : "absolute";
    var oCfg = this.cfg;

    Dom.setStyle(this.element, "position", sCSSPosition);


    if(sCSSPosition == "static") {

        /*
            Remove the iframe for statically positioned menus since it will 
            intercept mouse events.
        */

        oCfg.setProperty("iframe", false);


        // Statically positioned menus are visible by default
        
        Dom.setStyle(this.element, "display", "block");

        oCfg.setProperty("visible", true);

    }
    else {

        /*
            Even though the "visible" property is queued to 
            "false" by default, we need to set the "visibility" property to 
            "hidden" since Overlay's "configVisible" implementation checks the 
            element's "visibility" style property before deciding whether 
            or not to show an Overlay instance.
        */

        Dom.setStyle(this.element, "visibility", "hidden");
    
    }


    if(sCSSPosition == "absolute") {

        var nZIndex = oCfg.getProperty("zindex");

        if(!nZIndex || nZIndex === 0) {

            nZIndex = this.parent ? 
                (this.parent.parent.cfg.getProperty("zindex") + 1) : 1;

            oCfg.setProperty("zindex", nZIndex);

        }

    }

},


/**
* @method configIframe
* @description Event handler for when the "iframe" configuration property of the menu changes.
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
configIframe: function(p_sType, p_aArgs, p_oMenu) {    

    if(this.cfg.getProperty("position") == "dynamic") {

        YAHOO.widget.Menu.superclass.configIframe.call(
            this, 
            p_sType, 
            p_aArgs, 
            p_oMenu
        );

    }

},


/**
* @method configHideDelay
* @description Event handler for when the "hidedelay" configuration property of the menu changes.
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
configHideDelay: function(p_sType, p_aArgs, p_oMenu) {

    var nHideDelay = p_aArgs[0];
    var oMouseOutEvent = this.mouseOutEvent;
    var oMouseOverEvent = this.mouseOverEvent;
    var oKeyDownEvent = this.keyDownEvent;

    if(nHideDelay > 0) {

        /*
            Only assign event handlers once. This way the user change 
            the value for the hidedelay as many times as they want.
        */

        if(!this._hideDelayEventHandlersAssigned) {

            oMouseOutEvent.subscribe(this._execHideDelay, true);
            oMouseOverEvent.subscribe(this._cancelHideDelay, this, true);
            oKeyDownEvent.subscribe(this._cancelHideDelay, this, true);

            this._hideDelayEventHandlersAssigned = true;
        
        }

    }
    else {

        oMouseOutEvent.unsubscribe(this._execHideDelay, this);
        oMouseOverEvent.unsubscribe(this._cancelHideDelay, this);
        oKeyDownEvent.unsubscribe(this._cancelHideDelay, this);

        this._hideDelayEventHandlersAssigned = false;

    }

},


/**
* @method configContainer
* @description Event handler for when the "container" configuration property of the menu changes.
* @param {String} p_sType String representing the name of the event that was fired.
* @param {Array} p_aArgs Array of arguments sent when the event was fired.
* @param {YAHOO.widget.Menu} p_oMenu Object representing the menu that fired the event.
*/
configContainer: function(p_sType, p_aArgs, p_oMenu) {

	var oElement = p_aArgs[0];

	if(typeof oElement == 'string') {

        this.cfg.setProperty(
                "container", 
                document.getElementById(oElement), 
                true
            );

	}

},



// Public methods


/**
* Event handler called when the resize monitor element's "resize" evet is fired.
*/
onDomResize: function(e, obj) {

    if(!this._handleResize) {

        this._handleResize = true;
        return;
    
    }

    var oConfig = this.cfg;

    if(oConfig.getProperty("position") == "dynamic") {

        oConfig.setProperty("width", (this._getOffsetWidth() + "px"));

    }

    YAHOO.widget.Menu.superclass.onDomResize.call(this, e, obj);

},


/**
* @method initEvents
* @description Initializes the custom events for the menu.
*/
initEvents: function() {

	YAHOO.widget.Menu.superclass.initEvents.call(this);

    // Create custom events

    var CustomEvent = YAHOO.util.CustomEvent;

    this.mouseOverEvent = new CustomEvent("mouseOverEvent", this);
    this.mouseOutEvent = new CustomEvent("mouseOutEvent", this);
    this.mouseDownEvent = new CustomEvent("mouseDownEvent", this);
    this.mouseUpEvent = new CustomEvent("mouseUpEvent", this);
    this.clickEvent = new CustomEvent("clickEvent", this);
    this.keyPressEvent = new CustomEvent("keyPressEvent", this);
    this.keyDownEvent = new CustomEvent("keyDownEvent", this);
    this.keyUpEvent = new CustomEvent("keyUpEvent", this);
    this.itemAddedEvent = new CustomEvent("itemAddedEvent", this);
    this.itemRemovedEvent = new CustomEvent("itemRemovedEvent", this);

},


/**
* @method getRoot
* @description Finds the menu's root menu.
*/
getRoot: function() {

    var oItem = this.parent;

    if(oItem) {

        var oParentMenu = oItem.parent;

        return oParentMenu ? oParentMenu.getRoot() : this;

    }
    else {
    
        return this;
    
    }

},


/**
* @method toString
* @description Returns a string representing the menu.
* @return {String}
*/
toString: function() {

    return ("Menu " + this.id);

},


/**
* @method setItemGroupTitle
* @description Sets the title of a group of menu items.
* @param {String} p_sGroupTitle String specifying the title of the group.
* @param {Number} p_nGroupIndex Optional. Number specifying the group to which the title belongs.
*/
setItemGroupTitle: function(p_sGroupTitle, p_nGroupIndex) {
        
    if(typeof p_sGroupTitle == "string" && p_sGroupTitle.length > 0) {

        var nGroupIndex = typeof p_nGroupIndex == "number" ? p_nGroupIndex : 0;
        var oTitle = this._aGroupTitleElements[nGroupIndex];


        if(oTitle) {

            oTitle.innerHTML = p_sGroupTitle;
            
        }
        else {

            oTitle = document.createElement(this.GROUP_TITLE_TAG_NAME);
                    
            oTitle.innerHTML = p_sGroupTitle;

            this._aGroupTitleElements[nGroupIndex] = oTitle;

        }


        var i = this._aGroupTitleElements.length - 1;
        var nFirstIndex;

        do {

            if(this._aGroupTitleElements[i]) {

                Dom.removeClass(this._aGroupTitleElements[i], "first-of-type");

                nFirstIndex = i;

            }

        }
        while(i--);


        if(nFirstIndex !== null) {

            Dom.addClass(
                this._aGroupTitleElements[nFirstIndex], 
                "first-of-type"
            );

        }

    }

},



/**
* @method addItem
* @description Appends an item to the menu.
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance to be added to the menu.
* @param {String} p_oItem String specifying the text of the item to be added to the menu.
* @param {Object} p_oItem Object literal containing a set of menu item configuration properties.
* @param {Number} p_nGroupIndex Optional. Number indicating the group to which the item belongs.
* @return {YAHOO.widget.MenuItem}
*/
addItem: function(p_oItem, p_nGroupIndex) {

    if(p_oItem) {

        return this._addItemToGroup(p_nGroupIndex, p_oItem);
        
    }

},


/**
* @method addItems
* @description Adds an array of items to the menu.
* @param {Array} p_aItems Array of items to be added to the menu.  The array can contain strings specifying the text for each item to be created, object literals specifying each of the menu item configuration properties, or MenuItem instances.
* @param {Number} p_nGroupIndex Optional. Number specifying the group to which the items belongs.
* @return {Array}
*/
addItems: function(p_aItems, p_nGroupIndex) {

    function isArray(p_oValue) {
    
        return (typeof p_oValue == "object" && p_oValue.constructor == Array);
    
    }


    if(isArray(p_aItems)) {

        var nItems = p_aItems.length;
        var aItems = [];
        var oItem;


        for(var i=0; i<nItems; i++) {

            oItem = p_aItems[i];

            if(isArray(oItem)) {

                aItems[aItems.length] = this.addItems(oItem, i);

            }
            else {

                aItems[aItems.length] = 
                    this._addItemToGroup(p_nGroupIndex, oItem);
            
            }
    
        }


        if(aItems.length) {
        
            return aItems;
        
        }
    
    }

},


/**
* @method insertItem
* @description Inserts an item into the menu at the specified index.
* @param {YAHOO.widget.MenuItem} p_oItem Object reference for the MenuItem instance to be added to the menu.
* @param {String} p_oItem String specifying the text of the item to be added to the menu.
* @param {Object} p_oItem Object literal containing a set of menu item configuration properties.
* @param {Number} p_nItemIndex Number indicating the ordinal position at which the item should be added.
* @param {Number} p_nGroupIndex Optional. Number indicating the group to which the item belongs.
* @return {YAHOO.widget.MenuItem}
*/
insertItem: function(p_oItem, p_nItemIndex, p_nGroupIndex) {
    
    if(p_oItem) {

        return this._addItemToGroup(p_nGroupIndex, p_oItem, p_nItemIndex);

    }

},


/**
* @method removeItem
* @description Removes the specified item from the menu.
* @param {YAHOO.widget.MenuItem} p_oObject Object reference for the MenuItem instance to be removed from the menu.
* @param {Number} p_oObject Number specifying the index of the item to be removed.
* @param {Number} p_nGroupIndex Optional. Number specifying the group to which the item belongs.
* @return {YAHOO.widget.MenuItem}
*/
removeItem: function(p_oObject, p_nGroupIndex) {
    
    if(typeof p_oObject != "undefined") {

        var oItem;

        if(p_oObject instanceof YAHOO.widget.MenuItem) {

            oItem = this._removeItemFromGroupByValue(p_nGroupIndex, p_oObject);           

        }
        else if(typeof p_oObject == "number") {

            oItem = this._removeItemFromGroupByIndex(p_nGroupIndex, p_oObject);

        }

        if(oItem) {

            oItem.destroy();

            this.logger.log("Item removed." + 
                " Text: " + oItem.cfg.getProperty("text") + ", " + 
                " Index: " + oItem.index + ", " + 
                " Group Index: " + oItem.groupIndex);

            return oItem;

        }

    }

},


/**
* @method getItemGroups
* @description Returns a multi-dimensional array of all of the items in the menu.
* @return {Array}
*/        
getItemGroups: function() {

    return this._aItemGroups;

},


/**
* @method getItem
* @description Returns the item at the specified index.
* @param {Number} p_nItemIndex Number indicating the ordinal position of the item to be retrieved.
* @param {Number} p_nGroupIndex Optional. Number indicating the group to which the item belongs.
* @return {YAHOO.widget.MenuItem}
*/
getItem: function(p_nItemIndex, p_nGroupIndex) {
    
    if(typeof p_nItemIndex == "number") {

        var aGroup = this._getItemGroup(p_nGroupIndex);

        if(aGroup) {

            return aGroup[p_nItemIndex];
        
        }

    }
    
},


/**
* @method destroy
* @description Removes the menu's <code>&#60;div&#62;</code> element (and accompanying child nodes) from the document.
*/
destroy: function() {

    // Remove Custom Event listeners

    this.mouseOverEvent.unsubscribeAll();
    this.mouseOutEvent.unsubscribeAll();
    this.mouseDownEvent.unsubscribeAll();
    this.mouseUpEvent.unsubscribeAll();
    this.clickEvent.unsubscribeAll();
    this.keyPressEvent.unsubscribeAll();
    this.keyDownEvent.unsubscribeAll();
    this.keyUpEvent.unsubscribeAll();


    var nItemGroups = this._aItemGroups.length;
    var nItems;
    var oItemGroup;
    var oItem;
    var i;
    var n;


    // Remove all items

    if(nItemGroups > 0) {

        i = nItemGroups - 1;

        do {

            oItemGroup = this._aItemGroups[i];

            if(oItemGroup) {

                nItems = oItemGroup.length;
    
                if(nItems > 0) {
    
                    n = nItems - 1;
        
                    do {

                        oItem = this._aItemGroups[i][n];

                        if(oItem) {
        
                            oItem.destroy();
                        }
        
                    }
                    while(n--);
    
                }

            }

        }
        while(i--);

    }        


    // Continue with the superclass implementation of this method

    YAHOO.widget.Menu.superclass.destroy.call(this);
    
    this.logger.log("Destroyed.");

},


/**
* @method setInitialFocus
* @description Sets focus to the menu's first enabled item.
*/
setInitialFocus: function() {

    var oItem = this._getFirstEnabledItem();
    
    if(oItem) {
    
        oItem.focus();
    }
    
},


/**
* @method setInitialSelection
* @description Sets the "selected" configuration property of the menu's first enabled item to "true."
*/
setInitialSelection: function() {

    var oItem = this._getFirstEnabledItem();
    
    if(oItem) {
    
        oItem.cfg.setProperty("selected", true);
    }        

},


/**
* @method clearActiveItem
* @description Sets the "selected" configuration property of the menu's active item to "false" and hide's the item's submenu.
* @param {Boolean} p_bBlur Boolean indicating if the menu's active item should be blurred.  
*/
clearActiveItem: function(p_bBlur) {

    if(this.cfg.getProperty("showdelay") > 0) {
    
        this._cancelShowDelay();
    
    }


    var oActiveItem = this.activeItem;

    if(oActiveItem) {

        var oConfig = oActiveItem.cfg;

        oConfig.setProperty("selected", false);

        var oSubmenu = oConfig.getProperty("submenu");

        if(oSubmenu) {

            oSubmenu.hide();

        }

        if(p_bBlur) {

            oActiveItem.blur();
        
        }

    }

},


/**
* @description Initializes the class's configurable properties which can be
* changed using the menu's Config object ("cfg").
* @method initDefaultConfig
*/
initDefaultConfig: function() {

    YAHOO.widget.Menu.superclass.initDefaultConfig.call(this);

    var oConfig = this.cfg;

	// Add configuration properties

    /*
        Change the default value for the "visible" configuration 
        property to "false" by re-adding the property.
    */

    /**
    * @config visible
    * @description Boolean indicating whether or not the menu is visible.  If the menu's "position" configuration property is set to "dynamic" (the default), this property toggles the menu's <code>&#60;div&#62;</code> element's "visibility" style property between "visible" (true) or  "hidden" (false).  If the menu's "position" configuration property is set to "static" this property toggles the menu's <code>&#60;div&#62;</code> element's "display" style property between "block" (true) or "none" (false).
    * @default true
    * @type Boolean
    */
    oConfig.addProperty(
        "visible", 
        {
            value:false, 
            handler:this.configVisible, 
            validator:this.cfg.checkBoolean
         }
     );


    /*
        Change the default value for the "constraintoviewport" configuration 
        property to "true" by re-adding the property.
    */

    /**
    * @config constraintoviewport
    * @description Boolean indicating if the menu will try to remain inside the boundaries of the size of viewport.
    * @default true
    * @type Boolean
    */
    oConfig.addProperty(
        "constraintoviewport", 
        {
            value:true, 
            handler:this.configConstrainToViewport, 
            validator:this.cfg.checkBoolean, 
            supercedes:["iframe","x","y","xy"] 
        } 
    );


    /**
    * @config position
    * @description String indicating how a menu should be positioned on the screen.  Possible values are "static" and "dynamic."  Static menus are visible by default and reside in the normal flow of the document (CSS position: static).  Dynamic menus are hidden by default, reside out of the normal flow of the document (CSS position: absolute), and can overlay other elements on the screen.
    * @default dynamic
    * @type String
    */
    oConfig.addProperty(
        "position", 
        {
            value: "dynamic", 
            handler: this.configPosition, 
            validator: this._checkPosition,
            supercedes: ["visible"]
        }
    );


    /**
    * @config submenualignment
    * @description Array defining how submenus should be aligned to their parent menu item. The format is: [itemCorner, submenuCorner]. By default a submenu's top left corner is aligned to its parent menu item's top right corner.
    * @default ["tl","tr"]
    * @type Array
    */
    oConfig.addProperty("submenualignment", { value: ["tl","tr"] } );


    /**
    * @config autosubmenudisplay
    * @description Boolean indicating if submenus are automatically made visible when the user mouses over the menu's items.
    * @default true
    * @type Boolean
    */
	oConfig.addProperty(
	   "autosubmenudisplay", 
	   { 
	       value: true, 
	       validator: oConfig.checkBoolean
       } 
    );


    /**
    * @config showdelay
    * @description Number indicating the time (in milliseconds) that should expire before a submenu is made visible when the user mouses over the menu's items.
    * @default 0
    * @type Number
    */
	oConfig.addProperty(
	   "showdelay", 
	   { 
	       value: 0, 
	       validator: oConfig.checkNumber
       } 
    );


    /**
    * @config hidedelay
    * @description Number indicating the time (in milliseconds) that should expire before the menu is hidden.
    * @default 0
    * @type Number
    */
	oConfig.addProperty(
	   "hidedelay", 
	   { 
	       value: 0, 
	       validator: oConfig.checkNumber, 
	       handler: this.configHideDelay,
	       suppressEvent: true
       } 
    );


    /**
    * @config clicktohide
    * @description Boolean indicating if the menu will automatically be hidden if the user clicks outside of it.
    * @default true
    * @type Boolean
    */
    oConfig.addProperty(
        "clicktohide",
        {
            value: true,
            validator: oConfig.checkBoolean
        }
    );


	/**
	* @config container
	* @description HTML element reference or string specifying the id attribute of the HTML element that the menu's markup should be rendered into.
	* @type <a href="http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-html.html#ID-58190037">HTMLElement</a>|String
	* @default document.body
	*/
	this.cfg.addProperty(
	   "container", 
	   { value:document.body, handler:this.configContainer } 
   );

}

}); // END YAHOO.extend

})();