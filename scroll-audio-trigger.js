/**
 * ScrollAudioTrigger.js
 * A modern, robust, and highly configurable JavaScript attachment for HTML files.
 * Automatically indexes <p> elements (0-indexed) and triggers local audio (MP3/OGG)
 * based on the active paragraph's scroll position.
 *
 * @author Jules
 * @version 1.0.0
 */

(function (global) {
    'use strict';

    class ScrollAudioTrigger {
        /**
         * @param {Object} options Configuration options
         * @param {number} options.viewportThreshold Viewport ratio (0.0 to 1.0) marking the scroll trigger line. Default 0.4 (40% from top).
         * @param {Object} options.audioMap Object mapping paragraph indices to local audio paths. E.g., { 2: "audio/sound.mp3" }
         * @param {boolean} options.stopPrevious Whether to stop currently playing paragraph audio when a new trigger is reached. Default true.
         * @param {boolean} options.replayOnReentry Whether to replay audio when scrolling back to an index. Default true.
         * @param {boolean} options.debug Enable visual guides, active index indicators, and console logs. Default false.
         */
        constructor(options = {}) {
            this.options = Object.assign({
                viewportThreshold: 0.4,
                audioMap: {},
                stopPrevious: true,
                replayOnReentry: true,
                debug: false
            }, options);

            this.paragraphs = [];
            this.audioObjects = {}; // Cache of Audio objects mapped by index
            this.currentActiveIndex = -1;
            this.lastTriggeredIndex = -1;
            this.userInteracted = false;

            this.init();
        }

        /**
         * Initialize the triggers, cache, and interaction hooks.
         */
        init() {
            // Exclusively index <p> elements
            this.paragraphs = Array.from(document.querySelectorAll('p'));

            if (this.paragraphs.length === 0) {
                console.warn('ScrollAudioTrigger: No <p> elements found on this page.');
                return;
            }

            // Extract inline data-audio attributes from <p> elements to populate/override maps
            this.paragraphs.forEach((p, index) => {
                const audioAttr = p.getAttribute('data-audio');
                if (audioAttr) {
                    this.options.audioMap[index] = audioAttr;
                }
            });

            this.preloadAudio();
            this.setupInteractions();
            this.setupScrollListener();

            if (this.options.debug) {
                this.createDebugUI();
            }

            // Run an initial check in case a specific element is already in view
            this.checkScrollPosition();
        }

        /**
         * Preload mapped audio tracks to guarantee minimal playback latency.
         */
        preloadAudio() {
            for (const [indexStr, src] of Object.entries(this.options.audioMap)) {
                if (src) {
                    const index = parseInt(indexStr, 10);
                    const audio = new Audio(src);
                    audio.preload = 'auto';
                    this.audioObjects[index] = audio;
                }
            }
        }

        /**
         * Listen to the first user interaction to bypass browser autoplay policies gracefully.
         */
        setupInteractions() {
            const unlockAudio = () => {
                this.userInteracted = true;
                if (this.options.debug) {
                    console.log('ScrollAudioTrigger: Browser audio context unlocked via user interaction.');
                }
                this.checkScrollPosition();

                // Clean up listeners once user interaction has been established
                ['click', 'touchstart', 'keydown', 'wheel'].forEach(event => {
                    window.removeEventListener(event, unlockAudio);
                });
            };

            ['click', 'touchstart', 'keydown', 'wheel'].forEach(event => {
                window.addEventListener(event, unlockAudio, { passive: true });
            });
        }

        /**
         * Setup performant scroll listener utilizing requestAnimationFrame.
         */
        setupScrollListener() {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.checkScrollPosition();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        /**
         * Calculate which paragraph is crossing or closest to the scroll trigger threshold line.
         */
        checkScrollPosition() {
            const viewportHeight = window.innerHeight;
            const thresholdPixel = viewportHeight * this.options.viewportThreshold;

            let closestIndex = -1;
            let closestDistance = Infinity;

            this.paragraphs.forEach((p, index) => {
                const rect = p.getBoundingClientRect();
                const distanceToThreshold = rect.top - thresholdPixel;

                // Case 1: Paragraph overlaps the threshold line exactly
                if (rect.top <= thresholdPixel && rect.bottom >= thresholdPixel) {
                    closestIndex = index;
                    closestDistance = 0;
                }
                // Case 2: Fallback to the paragraph closest to the threshold line
                else if (Math.abs(distanceToThreshold) < Math.abs(closestDistance)) {
                    closestDistance = distanceToThreshold;
                    closestIndex = index;
                }
            });

            if (closestIndex !== -1 && closestIndex !== this.currentActiveIndex) {
                this.currentActiveIndex = closestIndex;
                this.onActiveIndexChange(closestIndex);
            }
        }

        /**
         * Fired when the active scrolling paragraph index updates.
         * @param {number} index The index of the new active paragraph.
         */
        onActiveIndexChange(index) {
            if (this.options.debug) {
                console.log(`ScrollAudioTrigger: Paragraph index ${index} is now active.`);
                this.updateDebugUI(index);
            }

            const audioSrc = this.options.audioMap[index];
            if (!audioSrc) return;

            // Handle replay settings
            if (!this.options.replayOnReentry && this.lastTriggeredIndex === index) {
                return;
            }

            this.lastTriggeredIndex = index;
            this.playAudio(index);
        }

        /**
         * Plays the audio mapped to a specific index.
         * @param {number} index The active index trigger.
         */
        playAudio(index) {
            if (!this.userInteracted) {
                if (this.options.debug) {
                    console.warn(`ScrollAudioTrigger: Autoplay blocked. Waiting for user click/scroll to trigger audio index ${index}.`);
                }
                return;
            }

            const audio = this.audioObjects[index] || new Audio(this.options.audioMap[index]);
            this.audioObjects[index] = audio;

            if (this.options.stopPrevious) {
                this.stopAllAudioExcept(index);
            }

            if (this.options.debug) {
                console.log(`ScrollAudioTrigger: Initiating play for index ${index}: ${this.options.audioMap[index]}`);
            }

            audio.currentTime = 0;
            audio.play().catch(err => {
                console.error(`ScrollAudioTrigger: Playback failed for index ${index}.`, err);
            });
        }

        /**
         * Stops playing all registered audio except the specified active audio index.
         * @param {number} activeIndex The currently active paragraph index.
         */
        stopAllAudioExcept(activeIndex) {
            for (const [idxStr, audio] of Object.entries(this.audioObjects)) {
                const idx = parseInt(idxStr, 10);
                if (idx !== activeIndex && !audio.paused) {
                    if (this.options.debug) {
                        console.log(`ScrollAudioTrigger: Stopping previous audio index ${idx}`);
                    }
                    audio.pause();
                    audio.currentTime = 0;
                }
            }
        }

        /**
         * Creates clean debug UI widgets: a line representing the viewport threshold
         * and a status box displaying current index information.
         */
        createDebugUI() {
            // Visual line indicating the exact scroll trigger threshold
            const line = document.createElement('div');
            line.id = 'scroll-audio-trigger-debug-line';
            line.style.position = 'fixed';
            line.style.left = '0';
            line.style.right = '0';
            line.style.top = `${this.options.viewportThreshold * 100}%`;
            line.style.height = '2px';
            line.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
            line.style.zIndex = '999999';
            line.style.pointerEvents = 'none';

            const label = document.createElement('span');
            label.innerText = 'Trigger Line';
            label.style.position = 'absolute';
            label.style.right = '15px';
            label.style.top = '-20px';
            label.style.color = 'red';
            label.style.fontSize = '12px';
            label.style.fontFamily = 'monospace';
            line.appendChild(label);

            document.body.appendChild(line);

            // Floating status overlay panel
            const overlay = document.createElement('div');
            overlay.id = 'scroll-audio-trigger-debug-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '15px';
            overlay.style.left = '15px';
            overlay.style.backgroundColor = 'rgba(25, 25, 25, 0.9)';
            overlay.style.color = '#00ffcc';
            overlay.style.padding = '12px 18px';
            overlay.style.borderRadius = '6px';
            overlay.style.fontFamily = 'monospace';
            overlay.style.fontSize = '13px';
            overlay.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
            overlay.style.border = '1px solid #00ffcc';
            overlay.style.zIndex = '999999';
            overlay.style.pointerEvents = 'none';
            overlay.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #00ffcc; padding-bottom: 4px;">ScrollAudioTrigger Status</div>
                <div>Active &lt;p&gt; Index: <span id="sat-debug-active-index" style="color: #fff; font-weight: bold;">-</span></div>
                <div>Audio Target: <span id="sat-debug-audio" style="color: #fff;">-</span></div>
                <div>User Interact: <span id="sat-debug-interaction" style="color: #fff;">No</span></div>
            `;
            document.body.appendChild(overlay);

            const updateInteractionLabel = () => {
                const interactEl = document.getElementById('sat-debug-interaction');
                if (interactEl) {
                    interactEl.innerText = this.userInteracted ? 'Yes (Unlocked)' : 'No (Interact with page)';
                    interactEl.style.color = this.userInteracted ? '#00ff00' : '#ff3333';
                }
            };

            ['click', 'touchstart', 'keydown', 'wheel'].forEach(event => {
                window.addEventListener(event, () => setTimeout(updateInteractionLabel, 50), { passive: true });
            });
            setTimeout(updateInteractionLabel, 100);
        }

        /**
         * Update the debug UI with details of the currently active index.
         * @param {number} index Current active paragraph index.
         */
        updateDebugUI(index) {
            const activeEl = document.getElementById('sat-debug-active-index');
            const audioEl = document.getElementById('sat-debug-audio');

            if (activeEl) {
                activeEl.innerText = index;
            }
            if (audioEl) {
                audioEl.innerText = this.options.audioMap[index] || 'None (No audio mapped)';
            }

            // Visually highlight active paragraph on page
            this.paragraphs.forEach((p, idx) => {
                if (idx === index) {
                    p.style.transition = 'background-color 0.3s ease';
                    p.style.backgroundColor = 'rgba(0, 255, 204, 0.1)';
                    p.style.borderLeft = '4px solid #00ffcc';
                    p.style.paddingLeft = '10px';
                } else {
                    p.style.backgroundColor = '';
                    p.style.borderLeft = '';
                    p.style.paddingLeft = '';
                }
            });
        }
    }

    // Expose ScrollAudioTrigger to global context
    global.ScrollAudioTrigger = ScrollAudioTrigger;

    // Automatic initialization if any <p> element has data-audio specified
    document.addEventListener('DOMContentLoaded', () => {
        const hasDataAttrs = Array.from(document.querySelectorAll('p')).some(p => p.hasAttribute('data-audio'));
        if (hasDataAttrs) {
            console.log('ScrollAudioTrigger: Auto-initializing via DOM data-audio attributes...');
            new ScrollAudioTrigger({ debug: true });
        }
    });

})(typeof window !== 'undefined' ? window : this);
