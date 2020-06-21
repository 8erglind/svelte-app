<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let firstSetup = true;
	let secondSetup = false;
	let thirdSetup = false;
	let fourthSetup = false;
	let fifthSetup = false;
	let sixthSetup = false;
	let sixthText = false;
	let seventhSetup = false;
	let eighthSetup = false;

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
		sixthSetup = false;

		sixthText = false;
	}
	const togglesixthSetup = () => {
		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;

		sixthText = true;
	}
	const toggleseventhSetup = () => {
		sixthSetup = false;
		seventhSetup = true;
		eighthSetup = false;

		sixthText = true;
	}
	const toggleeighthSetup = () => {
		seventhSetup = false;
		eighthSetup = true;

		sixthText = true;
	}

</script>




<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
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
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthSetup}
	<div class="buttonNext" on:click={toggleseventhSetup}></div>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}
{#if seventhSetup}
	<div class="buttonNext" on:click={toggleeighthSetup}></div>
	<div class="buttonPrev" on:click={togglesixthSetup}></div>
{/if}
{#if eighthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggleseventhSetup}></div>
{/if}





<!--    TEXT    -->


<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>
{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Some argue that climate action in the west is useless if large countries such as China and India don't take action [as if the west is suddenly powerless without eastern leadership]. <!--The west has long relied on eastern influences, resources and labour (...so it feels lost/helpless when that is not guaranteed?).-->
	</div>
{/if}


{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		India is a former British colony, and has been independant since 1947. Following it's independance and up till the mid 60's, was an era of "golden age" Hindi cinema. <!--with movies such as (?Mother India? 1957).-->
	</div>

	<div class="horizontalLine left line73" style="width: 100%;"></div>
	<div class="text years left line73">1947</div>
	

	<div class="horizontalLine left line55" style="width: 100%;"></div>
	<div class="text years left line55">1965</div>
	
	<img style="position: absolute; width: 50%; right: 5%; top: 23%;" src="https://i0.wp.com/notsocommon.in/wp-content/uploads/2020/03/EDx-TkVUwAANds0.jpg">
{/if}

{#if firstSetup}
{:else}
	<div class="line left line73"></div>
	<div class="line left line55"></div>
{/if}


{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Within the film-industry was born a strong film-music industry with composers such as R. D. Burman, who wrote the song XXX for the 1981 movie <span style="font-family: arita;">एक&nbsp;दूजे&nbsp;के&nbsp;लिए</span> (Ek Duuje Ke Liye or We Are Made For Each Other). <!-- LINK which was later sampled in Britney Spears's Toxic -->
	</div>

	<div class="horizontalLine left line39" style="width: 100%;"></div>
	<div class="text years left line39">1981</div>
{/if}

{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		<div class="line left line39"></div>

		<div class="prePics" style="top: calc({distanceBLines} * 2.45); left: calc({marginSides} + 5px);">
			<img class="smallPic" src="https://i0.wp.com/notsocommon.in/wp-content/uploads/2020/03/EDx-TkVUwAANds0.jpg">
		</div>
	{/if}
{/if}


{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		A few years later, in 1990, Asha Puthli published the album Hari Om, named after one of the songs of the album, an indian rendition of Madonna's Like a Prayer. Another song on the album is an indian version of Smooth Criminal, Chipko Chipko.
	</div>

	<div class="horizontalLine left line30" style="width: 100%;"></div>
	<div class="text years left line30">1990</div>
	
{/if}


{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		{#if thirdSetup}
		{:else}
			<div class="line left line30"></div>
		{/if}
	{/if}
{/if}


{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The meaning of Chipko is to hug, embrace or stick to. <span style="font-family: arita;">चिपको&nbsp;आंदोलन</span> (The Chipko Andalon) is a eco-feminist movement formed in 1974 by a group of women, lead by Gaura Devi. Following a tradition of the Bishnois in 1700's, they saved 2.500 trees in Uttarakhand from lodgers by embracing them and influenced a treecutting ban in 1980. <!-- LINKS https://www.thebetterindia.com/176217/uttarakhand-chipko-movement-history-gaura-devi-environment/   and     https://www.youtube.com/watch?v=Hqwns1tyN0M --> <!--[When this is written, Cyclone Amphan is ravaging indian forrests and has destroyed around 16,000 trees in Kolkata]--> <!-- https://www.thehindu.com/news/national/other-states/over-28-of-sunderbans-damaged-in-cyclone-amphan/article31760595.ece -->
	</div>

	<div class="horizontalLine left line46" style="width: 100%;"></div>
	<div class="text years left line46">1974</div>
	<div class="horizontalLine left line40" style="width: 100%;"></div>
	<div class="text years left line40">1980</div>
{/if}


{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		{#if thirdSetup}
		{:else}
			{#if fourthSetup}
			{:else}
			<div class="line left line46"></div>
			<div class="line left line40"></div>
			{/if}
		{/if}
	{/if}
{/if}


{#if sixthText}
	<div class="pagetext" style="transform: rotate({rotate});">
		India &mdash; which will see an increase of X hot days in the next two decades, Y the two decades after that and Z in the two decades leading up to 2100 if business is left "as usual" &mdash; is not devoid of environmentalism, and although India will need to take radical some climate action, the impact of India is not ranked high (better words!).
	</div>

	<div class="tempMeterCountry">
		<div class="temperature infotext">
			<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
		</div>
	</div>
{/if}









<!-- GRAPH -->

{#if sixthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200.5 365 900.5 347 900.5 347 1200.5 365 1200.5"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text narrow">&#10013; 103.811</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">18 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}
{#if seventhSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200.5 365 900.5 365 600.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013; 252.086</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">39 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}
{#if eighthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200.5 365 900.5 365 600.5 365 300.5 365 0.5 263 0.5 263 300.5 326 600.5 326 900.5 347 900.5 347 1200.5 365 1200.5"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013; 617.903</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">102 days</span></div>
	</div>

	<div class="text years right line60">2080</div>
	<div class="horizontalLine full right line60"></div>
	<div class="line right line60"></div>
	<div class="text years right line80">2100</div>
	<div class="horizontalLine full right line80"></div>
	<div class="line right line80"></div>
{/if}







<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>

<!-- FOOTER -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			<a>Sources [1], [2], [3].</a>
		</div>
</div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>





<style>

	.text, .text a, .pagetext {color: darkorange !important;}
	.verticalLine {border-right: 1px dotted darkorange;}
	.horizontalLine {border-top: 1px dotted darkorange;}
	.line {background-color: darkorange;}


	.tempMeterCountry {
		border-left: 1px solid darkorange; 
		border-right: 1px solid darkorange;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted darkorange;}
	.firstMeter {width: calc(((100% / 365) * 18) - 1px);}
	.midMeter {width: calc(((100% / 365) * 39) - 1px);}
	.endMeter {width: calc(((100% / 365) * 102) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted darkorange;}
	.rightFirst {right: calc(((100vw / 365) * 18) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 39) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 102) - 1px);}


</style>