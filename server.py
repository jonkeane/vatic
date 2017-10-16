import os.path, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import config
from turkic.server import handler, application
from turkic.database import session
import cStringIO
from models import *
import re

import logging
logger = logging.getLogger("vatic.server")

@handler()
def getjob(id, verified):
    # verified here is training (from bootstrap.js)
    # if 1, there should be training (that is *not* verified)
    # if 0 there should not be training (becuase the turker *is* verified)

    job = session.query(Job).filter(Job.assignmentid == None).first()

    logger.debug("Found job {0}".format(job.id))
    logger.debug("Verified: {0}".format(int(verified)))
    logger.debug("train with: {0}".format(job.segment.video.trainwith))

    if int(verified) and job.segment.video.trainwith:
        # if job.segment.video.trainwith:
        # swap segment with the training segment
        training = True
        segment = job.segment.video.trainwith.segments[0]
        train_with_id = job.segment.video.trainwithid
        logger.debug("Swapping actual segment ({0}) with training segment ({1})".format(job.segment.video.id, train_with_id))
    else:
        training = False
        segment = job.segment
        train_with_id = 0
    logger.debug(segment)

    video = segment.video

    labels = dict((l.id, l.text) for l in video.labels)
    logger.debug(format(labels))

    attributes = {}
    for label in video.labels:
        attributes[label.id] = dict((a.id, a.text) for a in label.attributes)

    logger.debug(attributes)
    logger.debug("Giving user frames {0} to {1} of {2}".format(video.slug,
                                                               segment.start,
                                                               segment.stop))

    return {"start":        segment.start,
            "stop":         segment.stop,
            "slug":         video.slug,
            "width":        video.width,
            "height":       video.height,
            "skip":         video.skip,
            "perobject":    video.perobjectbonus,
            "completion":   video.completionbonus,
            "blowradius":   video.blowradius,
            "jobid":        job.id,
            "training":     int(training),
            "labels":       labels,
            "attributes":   attributes,
            "train_with_id": train_with_id}

@handler()
def getboxesforjob(id):
    job = session.query(Job).get(id)
    result = []
    for path in job.paths:
        attrs = [(x.attributeid, x.frame, x.value) for x in path.attributes]
        result.append({"label": path.labelid,
                       "boxes": [tuple(x) for x in path.getboxes()],
                       "attributes": attrs})
    return result

def readpaths(tracks):
    paths = []
    logger.debug("Reading {0} total tracks".format(len(tracks)))

    for label, track, attributes in tracks:
        path = Path()
        path.label = session.query(Label).get(label)

        logger.debug("Received a {0} track".format(path.label.text))

        for frame, userbox in track.items():
            box = Box(path = path)
            box.xtl = max(int(userbox[0]), 0)
            box.ytl = max(int(userbox[1]), 0)
            box.xbr = max(int(userbox[2]), 0)
            box.ybr = max(int(userbox[3]), 0)
            box.occluded = int(userbox[4])
            box.outside = int(userbox[5])
            box.frame = int(frame)

            logger.debug("Received box {0}".format(str(box.getbox())))

        for attributeid, timeline in attributes.items():
            attribute = session.query(Attribute).get(attributeid)
            for frame, value in timeline.items():
                aa = AttributeAnnotation()
                aa.attribute = attribute
                aa.frame = frame
                aa.value = value
                path.attributes.append(aa)

        paths.append(path)
    return paths

@handler(post = "json")
def savejob(id, tracks):
    job = session.query(Job).get(id)

    for path in job.paths:
        session.delete(path)
    session.commit()
    for path in readpaths(tracks):
        job.paths.append(path)

    session.add(job)
    session.commit()

@handler(post = "json")
def newlabel(id, postdata):
    # takes an old label id and post data with a new label and video id
    # then insert it into the labels database

    # strip any charaters that are not in our annotation set
    # SQL alchemy should quote special characters, but this is a good defense as well.
    # This allows all letters, numbers, ?, *, [, ], :, #, !, -
    text = re.sub("[^A-z0-9 \?\*\[\]\:\#\!\\-]","",postdata['labeltext'])

    if isinstance(postdata['jobid'], (int, long)):
        # only interact with DB if jobid is an integer (to avoid sql-injection)
        # add start/end attributes
        job = session.query(Job).get(postdata['jobid'])
        segment = job.segment
        video = segment.video
    else:
        # return error if jobid isn't an integer
        return "error"

    label = Label(text = text, videoid = video.id)
    session.add(label)

    logger.debug(video.labels)
    attributes = {}
    for lbl in video.labels:
        logger.debug(lbl.id)
        logger.debug(int(id))
        if lbl.id == int(id):
            # only copy attributes from the old label id
            attributes[lbl.id] = dict((a.id, a.text) for a in lbl.attributes)

    newAttributes = attributes[int(id)]

    logger.debug('still working4')
    logger.debug(newAttributes)
    for attributeText in newAttributes.values():
        attribute = Attribute(text = attributeText)
        # add label id so these attribute as associated with the new label
        session.add(attribute)
        # this connects the attributes with the labels
        label.attributes.append(attribute)

    session.commit()

    return {'labelid': label.id,  'oldlabelid': id, 'newattributes':{label.attributes[0].text: label.attributes[0].id, label.attributes[1].text: label.attributes[1].id}}

@handler(post = "json")
def offensive(id, postdata):
    # marks the video as offensive.

    if isinstance(postdata['jobid'], (int, long)):
        # only interact with DB if jobid is an integer (to avoid sql-injection)
        # add start/end attributes
        job = session.query(Job).get(postdata['jobid'])
        segment = job.segment

        segment.offensive = True

        session.commit()
        msg = "This video has been marked as offensive. Thank you for your feedback. The HIT will be submited with this feedback and you can select a new one to work on."
    else:
        # return error if jobid isn't an integer
        msg = "There was an error in marking this video as offensive"


    return msg

@handler(post = "json")
def validatejob(id, tracks):
    logger.debug(id)
    logger.debug(tracks)

    job = session.query(Job).get(id)
    paths = readpaths(tracks)
    logger.debug(job)

    logger.debug("Here are some paths!")
    logger.debug(paths)
    logger.debug(job.trainingjob.paths)
    logger.debug("New paths")
    for pth in paths:
        logger.debug("\tid: "+format(pth.id))
        logger.debug("\tjobid: "+format(pth.jobid))
        logger.debug("\tjob: "+format(pth.job))
        logger.debug("\tlabelid: "+format(pth.labelid))
        logger.debug("\tlabel text: "+format(pth.label.text))

    logger.debug("Training paths")
    for pth in job.trainingjob.paths:
        logger.debug("\tid: "+format(pth.id))
        logger.debug("\tjobid: "+format(pth.jobid))
        logger.debug("\tjob: "+format(pth.job))
        logger.debug("\tlabelid: "+format(pth.labelid))
        logger.debug("\tlabel: "+format(pth.label))
        logger.debug("\tlabel text: "+format(pth.label.text))

    logger.debug(format(job.trainingjob.validator))


    return job.trainingjob.validator(paths, job.trainingjob.paths)

@handler()
def respawnjob(id):
    logger.debug("Respawning")
    job = session.query(Job).get(id)

    replacement = job.markastraining()
    logger.debug(replacement)

    # only verify worker if mturk is on (that is, worker exists)
    if job.worker != None:
        job.worker.verified = True

    session.add(job)
    session.add(replacement)
    session.commit()

    # if on mturk:
    replacement.publish() # fails here if not on mturk


    session.add(replacement)
    session.commit()
