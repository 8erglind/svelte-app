<script>
	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
	
	export let pagetitleText;
	export let rotate;
	export let prev;

	let firstSetup = true;	
	let secondSetup = false;
	let thirdSetup = false;
	let fourthSetup = false;
	let fifthSetup = false;

	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		thirdSetup = false;
	}
	const togglethirdSetup = () => {
		secondSetup = false;
		thirdSetup = true;
		fourthSetup = false;
	}
	const togglefourthSetup = () => {
		thirdSetup = false;
		fourthSetup = true;
		fifthSetup = false;
	}
	const togglefifthSetup = () => {
		fourthSetup = false;
		fifthSetup = true;
	}
</script>



<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext OneStuck" on:click={togglesecondSetup}></div>
{/if}
{#if secondSetup}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdSetup}
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}





<!--<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">(Please lock your phone in portrait mode)</div>-->



<div class="pagetitle Disappear" style="transform: rotate({rotate});">{pagetitleText}<sub>2</sub></div>

<div class="pagetitle OneStuck" style="transform: rotate({rotate});">now</div>

<div class="pagetitle then One leftOne" style="transform: rotate({rotate});">&amp; then</div>
<div class="pagetitle then One rightOne" style="transform: rotate({rotate});">&amp; then</div>

<div class="pagetitle then Two leftOne" style="transform: rotate({rotate});">&amp; then</div>
<div class="pagetitle then Two rightOne" style="transform: rotate({rotate});">&amp; then</div>

<div class="pagetitle then Three leftOne" style="transform: rotate({rotate});">&amp; then</div>
<div class="pagetitle then Three rightOne" style="transform: rotate({rotate});">&amp; then</div>


<div class="pagetext OneStuck" style="transform: rotate({rotate});">
	{#if firstSetup}&uarr; Press left side to click&nbsp;through, &uarr;<br>or swipe left to&nbsp;skip.{/if}
	{#if secondSetup}The past is full, full of era’s distinguished by people / culture / etc.{/if}
	{#if thirdSetup}The future is empty, hypothetical.{/if}
	{#if fourthSetup}“Heat will kill more people in 2100 than it does today”, is a hollow statement as the people killed do not yet exist.{/if}
	{#if fifthSetup}NOW AND THEN<sub>2</sub><br>manipulates time by looking at the past and the future as parallel lines, lines of THENs, growing from NOW. A sense of past humanity is reflected onto a heating future, lending it an ethos to better imagine what is at stake and when.{/if}
</div>




<!--<img style="position: absolute; bottom: 5%; width: 80%; left: 10%;" src="imgs/fanHalf.png">-->

<div class="activedotnew activedotFan"><div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div></div>



<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			<a href="https://www.glyphworld.online/" target="_blank">[font: GlyphWorld &nearr;&#xFE0E;]</a> 
			<a href="http://collletttivo.it/" target="_blank">[font: Ortica &nearr;&#xFE0E;]</a>
		</div>
</div>
	





<style>

	/*.pagetitle {bottom: 50vh;}*/
	.text, .text a, .pagetext {color: rgb(70,70,70) !important;}
	.line {background-color: rgb(70,70,70);}
	.criticalText {color: blue !important;}
	.verticalLine {border-right: 1px dotted blue;}
	.horizontalLine {border-top: 1px dotted blue;}

	.OneStuck {bottom: 5%;}

	.pagetext {bottom: 45% !important;}
	.then {width: max-content;}
	.rightOne {left: auto; right: -8%;}
	.leftOne {left: -8%;}
	.One {bottom: 20%;}
	.Two {bottom: 50%;}
	.Three {bottom: 80%;}

	/*.criticalText {
		animation-name: example; 
    	transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    animation-iteration-count: 2;
	    opacity: 0;
	}
	@keyframes example {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  80% {opacity: 1;}
	  100% {opacity: 0;}
	}*/

	/*.OneStuck, .One, .Two, .Three {
    	transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 0;
	}*/
	.OneStuck {
		animation-name: exampleOneStuck;
		transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 0;
	    animation-delay: 2s;
	    animation-fill-mode: forwards;
	}
	@keyframes exampleOneStuck {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  80% {opacity: 1;}
	  100% {opacity: 1;}
	}
	.One {
		animation-name: exampleOne;
		transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 0;
	    animation-iteration-count: 1;
	    animation-delay: 3s;
	    animation-fill-mode: forwards;
	}
	@keyframes exampleOne {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  100% {opacity: 1;}
	}
	.Two {
		animation-name: exampleTwo;
		transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 0;
	    animation-iteration-count: 1;
	    animation-delay: 4s;
	    animation-fill-mode: forwards;
	}
	@keyframes exampleTwo {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  100% {opacity: 1;}
	}
	.Three {
		animation-name: exampleThree;
		transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 0;
	    animation-iteration-count: 1;
	    animation-delay: 5s;
	    animation-fill-mode: forwards;
	}
	@keyframes exampleThree {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  100% {opacity: 1;}
	}

	.Disappear {
		animation-name: exampleDisappear;
		transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    opacity: 1;
	    animation-iteration-count: 1;
	    animation-delay: 0s;
	    animation-fill-mode: forwards;
	}
	@keyframes exampleDisappear {
	  0% {opacity: 1;}
	  80% {opacity: 1;}
	  100% {opacity: 0;}
	}

</style>