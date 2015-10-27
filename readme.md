# Txace ICD10 Project
## ICD-10 ANSI

### Documentation & Setup

ANSI processing it the ICD-10 is really two separate processes (uScripts).  The two uScripts are AnsiWrap and ANSIDX10.  AnsiWrap is optional and not required to generate claims with the necessary components to send ICD-10 codes for services after 10/1/2015.  But it does contain some functionality that some may find helpful.  The ANSIDX10 uScript is required in order to send claims with the appropriate ICD-9 or ICD=10 code and with the correct code set identifier.

#### Prerequisites

1. ISN Registers MUST be in place for each Event to be billed

2. The latest version of lib_DX10 installed and compiled. In this library

3. ANSIP is patched up to patch 422415 (3/30/2015)

4. The latest version of inc_DX10 installed on your system

5. RU2DXTYPE recode table will need to be created.  `I` is the input type `X` is the output type.  This table is used to recode the RU into one of the values `MH`, `ID` or `SA`.

6. This ANSIDX10 will ONLY use the new ICD-10 CMHC Record.  So it should ONLY be run AFTER your ICD-10 conversion process has been run in production.  This conversion should ONLY be run after your table t_ICD-10_ICD-9_with_GEM_AXIS has been updated with correct DX Categories using the script from GitHub ICD010-9_Sync_DX_CAT.sql.

7. AnsiWrap cannot be run from a cron.  It must be on a menu even when testing.

![AnsiWrap File Replacement Error](https://github.com/txace/txace-images/blob/master/ansiwrap-file-replacement-error.png)

#### uScript 

##### AnsiWrap

This uScript provides for some functionality that some users may find helpful

1. It checks for a billing file of the same name and path in the UNIX filesystem that will be created by the billing process.  If the file is present, the user is presented with a file replacement error message that provides the file date, file time and file owner.  This prevents staff from inadvertently overwriting a billing file that may not yet have been sent.  See an example of this error message below.  Note, this is an error message.  Hitting any key while on this message will cause the script to stop processing and no ANSI file will be created.

2. The process will create the needed “Version Parmfile” that tells the ANSI Processor that a 5010 compliant file will need to be created and provides the Billing Parmfile to the process. This process makes no provision for ANSI 4010 processing as this should no longer be needed.  Using this uScript will prevent staff from seeing the screen where they must indicate 4010 or 5010  version of the 837 file.  See example of Screen that still will NOT see below.
  
![Ansi 837 Version Prompt Screen](https://github.com/txace/txace-images/blob/master/ansi-837-version-prompt-screen.png)

3. While these two benefits seem small, they can be a significant time saver because staff are not allowed to make certain mistakes.

##### ANSIDX10

Certain Logic will be required to send correct diagnostic information in our ANSI Billing files.  Information points that this uScript considers before determining the appropriate data to send are:

1. Event Date: It gets this information from the ISN associated with the event.  

  -.  If the ISN Event date is >= 10/1/2015 the ICD-10 Code is sent and the code set identifier of ABK is also sent.
  -.  If the ISN Event date is < 10/1/2015, the ICD-9 code is sent and the code set identifier of BK is sent.

2. Is this an MH, ID or SA Service?  The ISN RU from the ISN associated with the event is recoded into the value of MH, ID or SA.  This value is used to select the highest ranking DX code for the event that matches the DX_Category. 


*NOTE* Set the variable dx10date as 10/01/2015 for production.  This date can be changed during testing.

#### Bill Parm Setup

The ANSIDX10 script is called by the ANSI P program.  There are two fields that must be in your Bill Parmfile.

```
102 013 07100                                        US=ANSIDX10 DX Codeset
102 001 07100                                        US=ANSIDX10 DX Code
```

#### Menu Setup

1.  Enter 466 as the program, Enter the desired security level and enter AnsiWrap() as the uScript name in the parameter section.

![AnsiWrap Menu Setup](https://github.com/txace/txace-images/blob/master/ansiwrap-menu-setup.png)

2. On the Update Additional Parameters Screen, enter your Bill Parameter File name under Add Parm 1.  The example below, the bill parameter name is MCODX10
    
![AnsiWrap Menu Additional Parm Setup](https://github.com/txace/txace-images/blob/master/ansiwrap-menu-additional-setup.png)

#### Tracing & Logging

If tracing and/or logging is desired, set a value for the variables `tracefile` or `logfile`. If these values are not data present, no logging or tracing will occur.

*NOTE* If tracing is desired, it should be noted that the `tracefile` will get replaced each time the script is executed.  And the script will be executed twice for each event in the billing file.  Therefore, tracing should only be activated for a single client and single event.  Additionally, one of the lines with US=ANSIDX10 should be commented out so that the tracefile only shows the result of a single execution.

Logging may provide more comprehensive information since the log file is not replaced for each execution of the uScript.  However, it simply shows the value being handed to the uScript (ISN ID) and the value that is returned to the ANSIP program (BK:ICD-9 code or ABK:ICD-10 Code)
