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
	let seventhSetup = false;
	let eightthSetup = false;
	let ninethSetup = false;

	let Popup = false;

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
	}
	const togglesixthSetup = () => {
		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;
	}
	const toggleseventhSetup = () => {
		sixthSetup = false;
		seventhSetup = true;
		eightthSetup = false;
	}
	const toggleeighthSetup = () => {
		seventhSetup = false;
		eightthSetup = true;
		ninethSetup = false;
	}
	const toggleninethSetup = () => {
		eightthSetup = false;
		ninethSetup = true;
		tenthSetup = false;
	}

	const togglePopup = () => {
		Popup = true;
	}
	const togglePopupClose = () => {
		Popup = false;
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
{#if eightthSetup}
	<div class="buttonNext" on:click={toggleninethSetup}></div>
	<div class="buttonPrev" on:click={toggleseventhSetup}></div>
{/if}
{#if ninethSetup}
	<!--<div class="buttonNext" on:click={toggletenthSetup}></div>-->
	<div class="buttonPrev" on:click={toggleeighthSetup}></div>
{/if}

<!-- CONTENT -->


<!--<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>-->
<div class="pagetitle" style="transform: rotate({rotate});">... is the<br>policy of<br>The<br>Critical<br>Decade:<br>III</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Climate action is a fight for human rights and dignity. It involves dismantling a system of exponential growth of capital, built on exploitation of the resources, labour and lives of those who it deems&nbsp;‘inferior’. 
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		At this point future people, as a collective, have been added to the long list of oppressed groups. This system has always been violent and life-killing, but at this point it is running out of life to kill, and so it’s invading the &mdash; unwritten and empty, vulnerable even &mdash;&nbsp;future.
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		bell hooks explained that in a system built on domination, greed and exploitation become normalized, and dehumanization becomes acceptable &mdash; even&nbsp;required. 
	</div>	
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		“We” did not cause this crisis, but by continuing to support the system of exploitation that is causing it, we are responsible for it (particularly those of us who hold a ‘superior’ status within this&nbsp;system).
	</div>	
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		We as individuals cannot “save the world” with our individual lifestyle choices alone, they mainly serve to remind us to be climate countious, our real power lies in demanding a just society. A system of exploitation will continue to operate until we decide dehumanization is unaceptable, in any&nbsp;form.
	</div>	
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Lethal heat is rising. It is now, in this critical decade, our responsibility to civilize. To lower our tolerance for exploitation and refuse to compromise our values. We must humanize all people (now or then) and practice radical&nbsp;love!
	</div>	
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		“Society’s collective fear of love must be faced if we are to lay claim to a love ethic that can inspire us and give us the courage to make necessary changes.” &mdash;&nbsp;bell&nbsp;lhooks
	</div>	
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Climate action is not action of saving “the Earth” or “the World” or “the Future”. It’s an action of respecting and loving the life and humanity <i>on</i>&nbsp;the Earth, <i>in</i>&nbsp;the World and <i>in</i>&nbsp;the&nbsp;Future.
	</div>	
{/if}

{#if ninethSetup}
	<div class="pagetext" style="transform: rotate({rotate}); bottom: 35%;">
		&rarr; Take a side &rarr;,<br> &rarr; make a pledge to love radically! &rarr;
	</div>	
{/if}





<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			<!--
			{#if fifthSetup}<a class="text" href="https://kabk.github.io/go-theses-20-berglind-johannsdottir/" target="_blank"> [thesis &nearr;&#xFE0E;]</a>{/if}
			{#if eightthSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			{#if ninethSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			{#if tenthSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			<a class="text" href="https://www.youtube.com/watch?v=LTRDHb-8EF0" target="_blank"> [more &nearr;&#xFE0E;]</a>
			<a class="text" href="https://abc.nl/book-details/all-about-love-new-visions/@9780060959470" target="_blank"> [more &nearr;&#xFE0E;]</a>
			-->
		</div>
</div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>


<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>


<div on:click={togglePopup} class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">Make a pledge</div>


{#if Popup}
<div class="popup">
	<div on:click={togglePopupClose} class="closebuttonPopup">X</div>
	<div class="textBoxPopup textPopup">
		<p class="criticalTextPopup">GREAT, Thank you!<br> 
		Here are some suggestional guidelines:<br>
		</p>
		<p><span class="meadow">-</span>&ensp;Hold governments/politicians and businesses accountable to cut carbon emissions by half by 2030, stop supporting those who refuse to.</p>
		<p><span class="meadow">+</span>&ensp;Give your vote to canditates that emphasize solutions, ...or run yourself!</p>
		<p><span class="meadow">-</span>&ensp;Hold governments/politicians and businesses accountable for valuing human rights, stop supporting those who enforce/profit from systems of exploitation.</p>
		<p><span class="meadow">+</span>&ensp;Give your money to organizations that pay their employees a living wage.</p>
		<p><span class="meadow">-</span>&ensp;Fight wealth inequality.</p><!--(show link of Bezos wealth), extreme exponential wealth is not sustainable-->
		<p><span class="meadow">-</span>&ensp;Fight racial inequality.</p>
		<p><span class="meadow">-</span>&ensp;Fight gender inequality. In strictly practical terms, a society that fails to listen to and educate women, deprives itself of important knowledge and points of view. (We are facing an existencial crisis and we need all the brainpower we can get.)</p>
		<!--<p><span class="meadow">+</span>Support non-patriarchal media.</p>-->
		<p><span class="meadow">-</span>&ensp;Try to cut your own CO2 emissions by half by 2030 and influence those around you to do the same. Individual lifestyle changes are a drop in the ocean but they count and they keep you motivated.</p>
		<p><span class="meadow">-</span>&ensp;Practice Radical Love!<br>“See our lives and our fate as ultimately connected to those of everyone else on the planet.”Pracice actions that “show a respect and gratitude for life”. - bell hooks all about love
		</p>

		<br><br>

		<p>This is not an exhaustive list, take&nbsp;it, develope&nbsp;it and make it your&nbsp;own.<br>
			You are accountable only to yourself.
		</p>
		<br><br>
		<p class="meadow">LETS GET RADICAL,<br>
				LOVE<br> 
				Berglind</p>

 	<!--Here is a (short) list of companies that don’t pay their employees garment workers: list
	- Here is a (short) list of companies that use prison labour: list-->
  <!--(UN ways of tackling climate change) -->
	<!--- “We can exercise that power all the time by not choosing to invest time, energy, or funds to support the production and dissemination of mass media images that do not reflect life-enhancing values, that undermine a love ethic.” (don’t mistake this as a call for censorship)-->
	</div>
</div>
{/if}





<style>

	.text, .text a, .pagetext {color: rgb(70,70,70) !important;}
	.criticalText {color: blue !important; z-index: 10;}
	.pagetext {bottom: 30%; width: 80vw;}
	.pagetitle {bottom: 65%;}
	.verticalLine {border-right: 1px dotted rgb(70,70,70);}
	.horizontalLine {border-top: 1px dotted rgb(70,70,70); width: 100%;}
	.line {background-color: rgb(70,70,70);}
	.tempMeterCountry {
		border-left: 1px solid rgb(70,70,70); 
		border-right: 1px solid rgb(70,70,70);
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted rgb(70,70,70);}
	.firstMeter {width: calc(((100% / 365) * 23) - 1px);}
	.midMeter {width: calc(((100% / 365) * 45) - 1px);}
	.endMeter {width: calc(((100% / 365) * 127) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted rgb(70,70,70);}
	.rightFirst {right: calc(((100vw / 365) * 23) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 45) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 127) - 1px);}

</style>