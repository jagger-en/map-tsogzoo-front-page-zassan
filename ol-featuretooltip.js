/**
 * ol-featuretooltip.js
 *
 * class FeatureToolTip 
 * Displays tooltip for vector features
 * 
 * MIT License
 * Copyright (c) 2018 Gede Mátyás
 * 
 */
function FeatureTooltip(options) {
    var opts=options||{};
    this_=this;
    //
    // default options
    //
    // show all features (if false, only the first feature is shown)
    this.showAll=false;
    // a list of attribute names to show or false if all attributes is shown
    this.attrs=false;
    // should attribute names be shown
    this.showAttrNames=true;
    // default tooltip function. can be overridden by any function(Array<Feature>) that returns a string.
    this.text=function(f) {
        var t='';
        for (var i=0;i<f.length;i++) {
            t+='<table class="ol-featuretooltip-table">';
            var ps=f[i].getProperties();
            for (var j in ps)
                if (j!='geometry'&&(!this.attrs||this.attrs.indexOf(j)>=0))
                    t+=(this.showAttrNames?('<tr><th>'+j+'</th>'):'')+'<td>'+ps[j]+'</td></tr>';
            /*var k=this.attrs||f[i].getKeys();
            for (var j=0;j<k.length;j++)
                if (k[j]!='geometry')
                    t+=(this.showAttrNames?('<tr><th>'+k[j]+'</th>'):'')+'<td>'+f[i].get(k[j])+'</td></tr>';*/
            t+='</table>';
            if (!this.showAll)
                break;
        }
        return t;    
    }
    // style to highlight feature. Falsey value means no highlight
    this.highlightStyle=false;
    
    // merge options
    for (var i in opts)
        this[i]=opts[i];
    // create div for tooltip
    var d=document.createElement('div');
    this.div=d;
    d.className='ol-featuretooltip';
    // create overlay
    var o=new ol.Overlay({
        element: d,
        offset: [10,0],
        positioning: 'bottom-left'
    });
    this.ovl=o;
    this.map.addOverlay(o);
    
    // array to store highlighted features and their original styles
    this.hlf=[];
    
    this.show=function(e) {
        var fs=[];
        if (e!==false)
            this_.map.forEachFeatureAtPixel(e.pixel,
                function(f) {
                    fs.push(f);
                });
        // restore style of no longer highlighted features and highlight current ones
        if (this_.highlightStyle) {
            while(this_.hlf.length>0) {
                var ff=this_.hlf.shift();
                ff.f.setStyle(ff.s);
            }
            for (var i=0;i<fs.length;i++) {
                this_.hlf.push({f:fs[i],s:fs[i].getStyle()});
                fs[i].setStyle(this_.highlightStyle);
                if (!this_.showAll)
                    break;
            }
        }
        // set tooltip content
        var cont=this_.text(fs);
        this_.div.style.display=cont?'':'none';
        if (cont) {
            this_.ovl.setPosition(e.coordinate);
            this_.div.innerHTML=cont;
        }
    };
    /** enable tooltips */
    this.enable=function() {
        this.map.on('pointermove', this.show);
    };
    /** disable tooltips */
    this.disable=function() {
        this.map.un('pointermove', this.show);
        this.show(false);
    };
    
    this.enable();               
}  