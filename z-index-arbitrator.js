#!/usr/bin/env node

/**
 * CSS Z-Index Arbitrator - Because 99999999 is NOT a strategy
 * Stops the z-index arms race before someone tries 100000000
 */

const fs = require('fs');
const path = require('path');

class ZIndexArbitrator {
  constructor() {
    this.layers = {
      'underworld': -1,          // Where bad decisions go
      'default': 0,              // The vanilla layer
      'content': 10,             // Actual content, imagine that!
      'dropdown': 100,           // Menus that think they're special
      'modal': 1000,             // "Look at me!" elements
      'tooltip': 1100,           // Helpful but annoying
      'notification': 1200,      // Important updates nobody reads
      'god-mode': 9999           // Emergency override (use sparingly!)
    };
    
    // Track custom layers to avoid collisions
    this.customLayers = new Map();
  }
  
  /**
   * Get a sensible z-index value
   * @param {string} layer - Predefined layer name
   * @param {number} offset - Small adjustment (not 9999!)
   * @returns {number} A reasonable z-index value
   */
  get(layer = 'content', offset = 0) {
    if (this.layers[layer] !== undefined) {
      return this.layers[layer] + offset;
    }
    
    // Generate a custom layer if it doesn't exist
    if (!this.customLayers.has(layer)) {
      const baseValue = Object.values(this.layers).reduce((max, val) => 
        Math.max(max, val), 0);
      this.customLayers.set(layer, baseValue + 100);
    }
    
    return this.customLayers.get(layer) + offset;
  }
  
  /**
   * Diagnose why your z-index: 999999 isn't working
   * @param {string} cssFile - Path to CSS file
   */
  diagnose(cssFile) {
    try {
      const css = fs.readFileSync(cssFile, 'utf8');
      const zIndexRegex = /z-index\s*:\s*(\d+)/g;
      let match;
      const offenders = [];
      
      while ((match = zIndexRegex.exec(css)) !== null) {
        const value = parseInt(match[1]);
        if (value > 9999) {
          offenders.push(`🚨 z-index: ${value} - Are you trying to reach the moon?`);
        } else if (value > 1000) {
          offenders.push(`⚠️  z-index: ${value} - Getting a bit ambitious, eh?`);
        }
      }
      
      if (offenders.length > 0) {
        console.log('\n🔍 Z-Index Offenders Found:\n');
        offenders.forEach(msg => console.log(msg));
        console.log('\n💡 Try using named layers instead!');
      } else {
        console.log('✅ All z-index values look reasonable!');
      }
    } catch (err) {
      console.log(`❌ Could not read file: ${cssFile}`);
    }
  }
  
  /**
   * Show available layers (because remembering is hard)
   */
  listLayers() {
    console.log('\n🎨 Available Z-Index Layers:\n');
    Object.entries(this.layers).forEach(([name, value]) => {
      console.log(`${name.padEnd(15)} → ${value}`);
    });
    console.log('\nUsage: arbitrator.get("modal") // returns 1000');
  }
}

// CLI interface - because GUIs are for people with time
if (require.main === module) {
  const arbitrator = new ZIndexArbitrator();
  const args = process.argv.slice(2);
  
  if (args[0] === 'diagnose' && args[1]) {
    arbitrator.diagnose(args[1]);
  } else if (args[0] === 'layers') {
    arbitrator.listLayers();
  } else if (args[0]) {
    const offset = args[1] ? parseInt(args[1]) : 0;
    console.log(arbitrator.get(args[0], offset));
  } else {
    console.log(`
🎯 CSS Z-Index Arbitrator - Stop the madness!

Commands:
  node ${path.basename(__filename)} modal          # Get z-index for modal layer
  node ${path.basename(__filename)} dropdown 5     # Get with offset
  node ${path.basename(__filename)} layers         # Show all layers
  node ${path.basename(__filename)} diagnose file.css # Find z-index crimes

Example CSS:
  .modal { z-index: ${arbitrator.get('modal')}; }
    `);
  }
}

module.exports = ZIndexArbitrator;
